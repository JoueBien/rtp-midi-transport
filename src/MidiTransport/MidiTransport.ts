import {
  EventEmitterController,
  UdpTransport,
  counterFactory,
  delay,
  timestamp,
} from "@joue-bien/audio-transport";
import { Failure, Result } from "fail-up";
import {
  DecodedMidiTransportMessage,
  MidiTransportMessageRespondParams,
  MidiTransportMessageSendParams,
  MidiTransportUnknownEvent,
} from "./../types";
import { MidiTransportMessage } from "./MidiTransportMessage";
import {
  EMIT_ERROR,
  EMIT_MESSAGE_ALL,
  EMIT_MESSAGE_BY,
  EMIT_MESSAGE_CK,
  EMIT_MESSAGE_FB,
  EMIT_MESSAGE_IN,
  EMIT_MESSAGE_MIDI,
  EMIT_MESSAGE_NO,
  EMIT_MESSAGE_OK,
} from "./../constrains/message";
import { castMidiTransportMessageSendParamsTo } from "./../utils/cast/castMidiTransportMessageSendParamsTo";
import { type MidiTransportLike } from "./MidiTransportLike";
import { addClockPulse } from "./routines/addClockPulse";
import { addBaseHandlers } from "./routines/addBaseHandlers";
import { connectAddListnersForClockSync } from "./routines/connectAddListnersForClockSync";
import { listenAddListnersForClockSync } from "./routines/listenAddListnersForClockSync";
import { connectOkCheck } from "./routines/connectOkCheck";
import { castMidiTransportMessageRespondParamsTo } from "../utils/cast/castMidiTransportMessageRespondParamsTo";
import {
  MidiTransportAnyEvent,
  MidiTransportSpecificEvent,
} from "../types/events";

export class MidiTransport implements MidiTransportLike {
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

  deconstructor() {
    this.cleanUpController.abort();
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

    // Send 3 Clock Sycns every 200ms.
    if (okayCheckRes === "ok") {
      (async () => {
        this.send({
          CK: {
            header: "CK",
            timestamps: [timestamp.nowRTP64Bit()],
          },
        });
        await delay({ ms: 200, cancelOnController: this.cleanUpController });
        this.send({
          CK: {
            header: "CK",
            timestamps: [timestamp.nowRTP64Bit()],
          },
        });
        await delay({ ms: 200, cancelOnController: this.cleanUpController });
        this.send({
          CK: {
            header: "CK",
            timestamps: [timestamp.nowRTP64Bit()],
          },
        });
        // Ensure we remain connected by continuing to share clock pulses.
        addClockPulse(this);
      })();
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
    listenAddListnersForClockSync(this);

    return this.cleanUpController;
  }

  /** Add a listener to listen for all messages. */
  onAnyMessage(callBack: (event: MidiTransportAnyEvent) => void) {
    return this.eventEmitter.listen(EMIT_MESSAGE_ALL, callBack);
  }

  /** Add a listener to listen for any message once. */
  onOnceAnyMessage(callBack: (event: MidiTransportAnyEvent) => void) {
    return this.eventEmitter.listenOnce(EMIT_MESSAGE_ALL, callBack);
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
  onMessage<T extends keyof DecodedMidiTransportMessage>(params: {
    command: T;
    callBack: (event: MidiTransportSpecificEvent<T>) => void;
  }) {
    const { command, callBack } = params;
    if (command === "midi") {
      return this.eventEmitter.listen(EMIT_MESSAGE_MIDI, callBack);
    }

    if (command === "IN") {
      return this.eventEmitter.listen(EMIT_MESSAGE_IN, callBack);
    }
    if (command === "CK") {
      return this.eventEmitter.listen(EMIT_MESSAGE_CK, callBack);
    }
    if (command === "OK") {
      return this.eventEmitter.listen(EMIT_MESSAGE_OK, callBack);
    }
    if (command === "BY") {
      return this.eventEmitter.listen(EMIT_MESSAGE_BY, callBack);
    }
    if (command === "NO") {
      return this.eventEmitter.listen(EMIT_MESSAGE_NO, callBack);
    }

    return this.eventEmitter.listen(EMIT_MESSAGE_FB, callBack);
  }

  /** Add a listener to listen for a message with an address once.*/
  onOnceMessage<T extends keyof DecodedMidiTransportMessage>(params: {
    command: T;
    callBack: (event: MidiTransportSpecificEvent<T>) => void;
  }) {
    const { command, callBack } = params;
    let cleanUp = () => {};
    function action(event: MidiTransportSpecificEvent<T>) {
      cleanUp();
      return callBack(event);
    }

    if (command === "midi") {
      cleanUp = this.eventEmitter.listen(EMIT_MESSAGE_MIDI, action);
      return cleanUp;
    }

    if (command === "IN") {
      cleanUp = this.eventEmitter.listen(EMIT_MESSAGE_IN, action);
      return cleanUp;
    }
    if (command === "CK") {
      cleanUp = this.eventEmitter.listen(EMIT_MESSAGE_CK, action);
      return cleanUp;
    }
    if (command === "OK") {
      cleanUp = this.eventEmitter.listen(EMIT_MESSAGE_OK, action);
      return cleanUp;
    }
    if (command === "BY") {
      cleanUp = this.eventEmitter.listen(EMIT_MESSAGE_BY, action);
      return cleanUp;
    }

    if (command === "NO") {
      cleanUp = this.eventEmitter.listen(EMIT_MESSAGE_NO, action);
      return cleanUp;
    }

    cleanUp = this.eventEmitter.listen(EMIT_MESSAGE_FB, action);
    return cleanUp;
  }

  /**
   * Wait for a message with an address.
   * Will return an error if does not get a message within 500 milliseconds.
   */
  async waitForMessage<T extends keyof DecodedMidiTransportMessage>(params: {
    command: T;
    /** @defaults to `500`. */
    exitMs?: number;
  }): Promise<Result<MidiTransportSpecificEvent<T>, "wait-timeout">> {
    const resolver = new Promise<
      Result<MidiTransportSpecificEvent<T>, "wait-timeout">
    >((resolve) => {
      const delayController = new AbortController();

      const cleanUp = this.onOnceMessage<T>({
        command: params.command,
        callBack: (event: MidiTransportSpecificEvent<T>) => {
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
  async sendAndWaitForMessage<
    T extends keyof MidiTransportMessageSendParams,
    Ret extends keyof MidiTransportMessageSendParams,
  >(params: {
    send: Pick<MidiTransportMessageSendParams, T>;
    listen: {
      command: Ret;
      exitMs?: number;
    };
  }) {
    const floatingPromise = this.waitForMessage<Ret>({
      command: params.listen.command,
      exitMs: params.listen.exitMs || 500,
    });
    await this.send<T>(params.send);
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

  /** Send a message on the client. */
  async send<T extends keyof MidiTransportMessageSendParams>(
    msg: Pick<MidiTransportMessageSendParams, T>,
  ) {
    if ("midi" in msg) {
      const { midi } = castMidiTransportMessageSendParamsTo<T, "midi">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        midi: {
          ...midi,
          sequence: this.getNextCounterNumber(),
          ssrc: this.ssrc,
        },
      });
      return this.messageClient.send(messageBuffer);
    }

    if ("CK" in msg) {
      const { CK } = castMidiTransportMessageSendParamsTo<T, "CK">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        CK: {
          ...CK,
          count: CK.timestamps.length,
          ssrc: this.ssrc,
        },
      });
      return this.messageClient.send(messageBuffer);
    }

    if ("IN" in msg) {
      const { IN } = castMidiTransportMessageSendParamsTo<T, "IN">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        IN: {
          ...IN,
          version: 2,
          token: this.token,
          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (IN.on === "message") {
        return this.messageClient.send(messageBuffer);
      }
      return this.controlClient.send(messageBuffer);
    }

    if ("OK" in msg) {
      const { OK } = castMidiTransportMessageSendParamsTo<T, "OK">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        OK: {
          ...OK,
          version: 2,
          token: this.token,
          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (OK.on === "message") {
        return this.messageClient.send(messageBuffer);
      }
      return this.controlClient.send(messageBuffer);
    }

    if ("NO" in msg) {
      const { NO } = castMidiTransportMessageSendParamsTo<T, "NO">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        NO: {
          ...NO,
          version: 2,
          token: this.token,
          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (NO.on === "message") {
        return this.messageClient.send(messageBuffer);
      }
      return this.controlClient.send(messageBuffer);
    }

    if ("BY" in msg) {
      const { BY } = castMidiTransportMessageSendParamsTo<T, "BY">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        BY: {
          ...BY,
          version: 2,
          token: this.token,
          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (BY.on === "message") {
        return this.messageClient.send(messageBuffer);
      }
      return this.controlClient.send(messageBuffer);
    }

    return new Failure<"send-failure">({
      type: "send-failure",
      message: `Faailed to send message with input of ${JSON.stringify(msg, null, 2)}.`,
    });
  }

  /** Respond with a message on the server. */
  async respond<T extends keyof MidiTransportMessageRespondParams>(params: {
    msg: Pick<MidiTransportMessageRespondParams, T>;
    to: {
      remotePort: number;
      remoteAddress: string;
    };
  }) {
    const {
      msg,
      to: { remoteAddress, remotePort },
    } = params;

    if ("midi" in params.msg) {
      const { midi } = castMidiTransportMessageRespondParamsTo<T, "midi">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        midi: {
          ...midi,
          sequence: this.getNextCounterNumber(),
          ssrc: this.ssrc,
        },
      });
      return this.messageClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("CK" in params.msg) {
      const { CK } = castMidiTransportMessageRespondParamsTo<T, "CK">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        CK: {
          ...CK,
          count: CK.timestamps.length,
          ssrc: this.ssrc,
        },
      });
      return this.messageClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("IN" in params.msg) {
      const { IN } = castMidiTransportMessageRespondParamsTo<T, "IN">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        IN: {
          ...IN,
          version: 2,
          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (IN.on === "message") {
        return this.messageClient.respond({
          msg: messageBuffer,
          remoteAddress,
          remotePort,
        });
      }
      return this.controlClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("OK" in params.msg) {
      const { OK } = castMidiTransportMessageRespondParamsTo<T, "OK">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        OK: {
          ...OK,
          version: 2,
          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (OK.on === "message") {
        return this.messageClient.respond({
          msg: messageBuffer,
          remoteAddress,
          remotePort,
        });
      }
      return this.controlClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("NO" in params.msg) {
      const { NO } = castMidiTransportMessageRespondParamsTo<T, "NO">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        NO: {
          ...NO,
          version: 2,
          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (NO.on === "message") {
        return this.messageClient.respond({
          msg: messageBuffer,
          remoteAddress,
          remotePort,
        });
      }
      return this.controlClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    if ("BY" in params.msg) {
      const { BY } = castMidiTransportMessageRespondParamsTo<T, "BY">(msg);
      const messageBuffer = MidiTransportMessage.encode({
        BY: {
          ...BY,
          version: 2,

          ssrc: this.ssrc,
          name: this.hardwareName,
        },
      });
      if (BY.on === "message") {
        return this.messageClient.respond({
          msg: messageBuffer,
          remoteAddress,
          remotePort,
        });
      }
      return this.controlClient.respond({
        msg: messageBuffer,
        remoteAddress,
        remotePort,
      });
    }

    return new Failure<"send-failure">({
      type: "send-failure",
      message: `Failed to reply message with input of ${JSON.stringify(params, null, 2)}.`,
    });
  }
}
