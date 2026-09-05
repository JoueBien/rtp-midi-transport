import {
  EventEmitterController,
  UdpTransport,
  counterFactory,
  delay,
  timestamp,
} from "@joue-bien/audio-transport";
import { RemoteInfo } from "dgram";
import { Failure, Result } from "fail-up";
import {
  AppleMIDICommand,
  Command,
  DecodedMidiTransportMessage,
  MidiTransportEvent,
  MidiTransportMessageSendParams,
} from "./types";
import { MidiTransportMessage } from "./MidiTransportMessage";
import { EMIT_ERROR, EMIT_MESSAGE } from "./constrains/message";

export class MidiTransport {
  controlClient: UdpTransport;
  messageClient: UdpTransport;

  eventEmitter = new EventEmitterController();
  cleanUpController: AbortController = new AbortController();

  hardwareName: string;
  getNextSSRCNumber: ReturnType<typeof counterFactory>;
  getNextCounterNumber: ReturnType<typeof counterFactory>;
  getNextTokenNumber: ReturnType<typeof counterFactory>;

  token: number;
  ssrc: number;

  constructor(args: {
    controlClient: Omit<
      ConstructorParameters<typeof UdpTransport>[0],
      "cleanUpController"
    >;
    messageClient: Omit<
      ConstructorParameters<typeof UdpTransport>[0],
      "cleanUpController"
    >;
    hardwareName: string;
    cleanUpController?: AbortController;
  }) {
    this.cleanUpController = args.cleanUpController || new AbortController();
    this.hardwareName = args.hardwareName;
    this.getNextCounterNumber = counterFactory(0, 16);
    this.getNextTokenNumber = counterFactory(0, 2_147_483_648);
    this.getNextSSRCNumber = counterFactory(0, 2_147_483_648);

    // Note:server doesn't need a token.
    this.token = this.getNextTokenNumber();
    this.ssrc = this.getNextSSRCNumber();

    this.controlClient = new UdpTransport({
      ...args.controlClient,
      cleanUpController: this.cleanUpController,
    });

    this.messageClient = new UdpTransport({
      ...args.messageClient,
      cleanUpController: this.cleanUpController,
    });
  }

  /** Connect and add a single listener so we only decode once. */
  async connect(): Promise<
    Result<AbortController, "connection-failed" | "connection-no">
  > {
    const controllConnected = await this.controlClient.connect();
    if (controllConnected instanceof Failure) {
      return controllConnected;
    }

    const messageConnected = await this.messageClient.connect();
    if (messageConnected instanceof Failure) {
      return messageConnected;
    }

    // Add listners.
    addBaseHandlers(this);

    // Make sure to reply to Clock Requests.
    connectAddListnersForClockSync(this);

    // Run OK Check procedure.
    const okayCheckRes = await connectOkCheck(this);

    // Send First Clock Sync.
    if (okayCheckRes === "ok") {
      this.send({
        clock: {
          header: "CK",
          count: 1,
          ssrc: this.ssrc,
          timestamps: [timestamp.nowRTP()],
        },
      });
    }

    return okayCheckRes === "ok" ? this.cleanUpController : okayCheckRes;
  }

  /**  Listen on single port */
  async listen(): Promise<Result<AbortController, "listen-failed">> {
    const [controllConnected, messageConnected] = [
      await this.controlClient.listen(),
      await this.messageClient.listen(),
    ];

    if (controllConnected instanceof Failure) {
      return controllConnected;
    }
    if (messageConnected instanceof Failure) {
      return messageConnected;
    }

    // Add listners.
    addBaseHandlers(this);

    // Make sure to reply to Clock Requests.
    connectAddListnersForClockSync(this);

    return this.cleanUpController;
  }

  /** Add a listener to listen for all messages. */
  onAnyMessage(callBack: (event: DecodedMidiTransportMessage) => void) {
    return this.eventEmitter.listen(EMIT_MESSAGE, callBack);
  }

  /** Add a listener to listen for any message once. */
  onOnceAnyMessage(callBack: (event: DecodedMidiTransportMessage) => void) {
    return this.eventEmitter.listenOnce(EMIT_MESSAGE, callBack);
  }

  /** Add a listener to listen for all errors. */
  onError(callBack: (err: Failure<"on-error">) => void) {
    return this.eventEmitter.listen(EMIT_ERROR, callBack);
  }

  /** Add a listener to listen for any error once. */
  onOnceError(callBack: (err: Failure<"on-error">) => void) {
    return this.eventEmitter.listenOnce(EMIT_ERROR, callBack);
  }

  /** Add a listener to listen for a messages with an address. */
  onMessage(params: {
    command: Command | AppleMIDICommand;
    callBack: (event: DecodedMidiTransportMessage) => void;
  }) {
    return this.eventEmitter.listen(
      EMIT_MESSAGE,
      (event: DecodedMidiTransportMessage) => {
        if ("control" in event && event.control.header === params.command) {
          return params.callBack(event);
        }
        if ("clock" in event && event.clock.header === params.command) {
          return params.callBack(event);
        }
        if ("midi" in event && event.midi.header === params.command) {
          return params.callBack(event);
        }
      },
    );
  }

  /** Add a listener to listen for a message with an address once.*/
  onOnceMessage(params: {
    command: Command | AppleMIDICommand;
    callBack: (event: DecodedMidiTransportMessage) => void;
  }) {
    const cleanUp = this.eventEmitter.listen(
      EMIT_MESSAGE,
      (event: DecodedMidiTransportMessage) => {
        if ("control" in event && event.control.header === params.command) {
          cleanUp();
          return params.callBack(event);
        }
        if ("clock" in event && event.clock.header === params.command) {
          cleanUp();
          return params.callBack(event);
        }
        if ("midi" in event && event.midi.header === params.command) {
          cleanUp();
          return params.callBack(event);
        }
      },
    );
    return cleanUp;
  }

  /**
   * Wait for a message with an address.
   * Will return an error if does not get a message within 500 milliseconds.
   */
  async waitForMessage(params: {
    command: Command | AppleMIDICommand;
    /** @defaults to `500`. */
    exitMs?: number;
  }): Promise<Result<DecodedMidiTransportMessage, "wait-timeout">> {
    const resolver = new Promise<
      Result<DecodedMidiTransportMessage, "wait-timeout">
    >((resolve) => {
      const delayController = new AbortController();

      const cleanUp = this.onOnceMessage({
        command: params.command,
        callBack: (event: DecodedMidiTransportMessage) => {
          delayController.abort();
          resolve(event);
        },
      });

      delay({
        ms: params.exitMs || 500,
        cancelOnController: delayController,
      }).then(() => {
        cleanUp();
        resolve(
          new Failure({
            message: `Too slow to reply on ${params.command}`,
            type: "wait-timeout",
          }),
        );
      });
    });

    return resolver;
  }

  /** Send and wait for a message. */
  async sendAndWaitForMessage(params: {
    send: MidiTransportMessageSendParams;
    listen: {
      command: Command | AppleMIDICommand;
      exitMs?: number;
    };
  }) {
    const floatingPromise = this.waitForMessage({
      command: params.listen.command,
      exitMs: params.listen.exitMs,
    });
    await this.send(params.send);
    return floatingPromise;
  }

  /** Check if the underlying client is connected. */
  async isListeningOk(): Promise<Result<"ok", "aborted" | "not-listening">> {
    const [controlOk, messageOk] = [
      await this.controlClient.isListeningOk(),
      await this.messageClient.isListeningOk(),
    ];
    if (controlOk instanceof Failure) {
      return controlOk;
    }
    if (messageOk instanceof Failure) {
      return messageOk;
    }
    return "ok";
  }

  /** Check if the underlying client is connected. */
  async isConnectionOk(): Promise<Result<"ok", "aborted" | "not-connected">> {
    const [controlOk, messageOk] = [
      await this.controlClient.isConnectionOk(),
      await this.messageClient.isConnectionOk(),
    ];
    if (controlOk instanceof Failure) {
      return controlOk;
    }
    if (messageOk instanceof Failure) {
      return messageOk;
    }
    return "ok";
  }

  /** Send a message. */
  async send(params: MidiTransportMessageSendParams) {
    const messageBuffer = MidiTransportMessage.encode(params);

    if ("control" in params && params.control.on === "control") {
      return this.controlClient.send(messageBuffer);
    }

    if ("control" in params && params.control.on === "message") {
      return this.messageClient.send(messageBuffer);
    }

    if ("clock" in params) {
      return this.messageClient.send(messageBuffer);
    }

    if ("midi" in params) {
      return this.messageClient.send(messageBuffer);
    }

    return new Failure<"send-failure">({
      type: "send-failure",
      message: `Faailed to send message with input of ${JSON.stringify(params, null, 2)}.`,
    });
  }

  /** Respond with a message. */
  async respond(
    params: MidiTransportMessageSendParams & {
      remotePort: number;
      remoteAddress: string;
    },
  ) {
    const { remoteAddress, remotePort, ...restParams } = params;

    const messageBuffer = MidiTransportMessage.encode(restParams);

    if ("control" in params && params.control.on === "message") {
      return this.controlClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("control" in params && params.control.on === "message") {
      return this.messageClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("clock" in params) {
      return this.messageClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("midi" in params) {
      return this.messageClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    return new Failure<"send-failure">({
      type: "send-failure",
      message: `Faailed to reply message with input of ${JSON.stringify(params, null, 2)}.`,
    });
  }
}

/** Add handlers to listen for events on both ports.  These listners are sutable for both client and server. */
function addBaseHandlers(transport: MidiTransport) {
  // Add listners
  transport.controlClient.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
    const data: MidiTransportEvent = {
      msg,
      decoded: MidiTransportMessage.decode(Uint8Array.from(msg)),
      on: "control",
      rinfo,
    };
    transport.eventEmitter.emit(EMIT_MESSAGE, data);
  });

  transport.controlClient.onError((err: Failure<"on-error">) => {
    transport.eventEmitter.emit(EMIT_ERROR, err);
  });

  transport.messageClient.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
    const data: MidiTransportEvent = {
      msg,
      decoded: MidiTransportMessage.decode(Uint8Array.from(msg)),
      on: "message",
      rinfo,
    };
    transport.eventEmitter.emit(EMIT_MESSAGE, data);
  });

  transport.messageClient.onError((err: Failure<"on-error">) => {
    transport.eventEmitter.emit(EMIT_ERROR, err);
  });
}

/** Add listners for clock sync. This listner is sutable for both client and server. */
function connectAddListnersForClockSync(transport: MidiTransport) {
  const cleanUp = transport.onMessage({
    command: "CK",
    callBack: (event) => {
      if ("clock" in event) {
        const { clock } = event;
        const { count, timestamps } = clock;
        if (count === 1 && timestamps[0]) {
          transport.send({
            clock: {
              ...clock,
              timestamps: [timestamps[0], timestamp.nowRTP()],
            },
          });
        }
        if (count === 2 && timestamps[1]) {
          transport.send({
            clock: {
              ...clock,
              timestamps: [timestamps[0], timestamps[1], timestamp.nowRTP()],
            },
          });
        }
      }
    },
  });
  return cleanUp;
}

/** Run through the IN/OK cycle on both ports. */
async function connectOkCheck(transport: MidiTransport) {
  // Knock on control port
  const [controlRejected, controlOkay] = await Promise.all([
    transport.waitForMessage({
      command: "NO",
      exitMs: 525,
    }),
    transport.sendAndWaitForMessage({
      send: {
        control: {
          on: "control",
          header: "IN",
          ssrc: transport.ssrc,
          token: transport.token,
          version: 2,
          name: transport.hardwareName,
        },
      },
      listen: {
        command: "OK",
      },
    }),
  ]);

  // We can talk on Control port
  if (
    controlRejected instanceof Failure &&
    controlOkay instanceof Failure === false
  ) {
    const [messageRejected, messageOkay] = await Promise.all([
      transport.waitForMessage({
        command: "NO",
        exitMs: 525,
      }),
      transport.sendAndWaitForMessage({
        send: {
          control: {
            on: "control",
            header: "IN",
            ssrc: transport.ssrc,
            token: transport.token,
            version: 2,
            name: transport.hardwareName,
          },
        },
        listen: {
          command: "OK",
        },
      }),
    ]);

    if (
      messageRejected instanceof Failure &&
      messageOkay instanceof Failure === false
    ) {
      return "ok";
    }
    transport.cleanUpController.abort();
    return new Failure<"connection-no">({
      type: "connection-no",
      message: "Server message port replyed with NO or did not respond",
    });
  }
  transport.cleanUpController.abort();
  return new Failure<"connection-no">({
    type: "connection-no",
    message: "Server control port replyed with no or did not respond",
  });
}
