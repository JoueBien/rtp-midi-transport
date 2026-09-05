import { type RemoteInfo } from "dgram";
import { type Arg, OscMessage, OscMessageEvent } from "./OscMessage";
import { Failure, type Result } from "fail-up";
import {
  delay,
  EventEmitterController,
  UdpTransport,
} from "@joue-bien/audio-transport";

const EMIT_MESSAGE = "message";
const EMIT_ERROR = "error";

export class OscTransport {
  client: UdpTransport;

  eventEmitter = new EventEmitterController();

  cleanUpController: AbortController = new AbortController();

  constructor(client: UdpTransport) {
    this.client = client;
  }

  /** Connect and add a single listener so we only decode once. */
  async connect(): Promise<Result<AbortController, "connection-failed">> {
    const connected = await this.client.connect();
    if (connected instanceof Failure) {
      return connected;
    }
    this.cleanUpController = connected;

    /** Set listeners. */
    this.client.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
      const data: OscMessageEvent = {
        msg,
        decoded: OscMessage.decode(Uint8Array.from(msg)),
        rinfo,
      };
      this.eventEmitter.emit(EMIT_MESSAGE, data);
    });

    this.client.onError((err: Failure<"on-error">) => {
      this.eventEmitter.emit(EMIT_ERROR, err);
    });

    /** Return a clean up controller. */
    return this.cleanUpController;
  }

  // Listen on a single port.
  async listen(): Promise<Result<AbortController, "listen-failed">> {
    const listening = await this.client.listen();

    if (listening instanceof Failure) {
      return listening;
    }
    this.cleanUpController = listening;

    /** Set listeners. */
    this.client.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
      const data: OscMessageEvent = {
        msg,
        decoded: OscMessage.decode(Uint8Array.from(msg)),
        rinfo,
      };
      this.eventEmitter.emit(EMIT_MESSAGE, data);
    });

    this.client.onError((err: Failure<"on-error">) => {
      this.eventEmitter.emit(EMIT_ERROR, err);
    });

    /** Return a clean up controller. */
    return this.cleanUpController;
  }

  /** Check if the underlying client is connected. */
  async isListeningOk(): Promise<Result<"ok", "aborted" | "not-listening">> {
    return this.client.isListeningOk();
  }

  /** Check if the underlying client is connected. */
  async isConnectionOk(): Promise<Result<"ok", "aborted" | "not-connected">> {
    return this.client.isConnectionOk();
  }

  /** Send a message. */
  async send(params: { address: string; args?: Arg[] }) {
    const message = OscMessage.encode(params.address, params.args);
    return this.client.send(message);
  }

  /** Respond with a message. */
  async respond(params: {
    address: string;
    args?: Arg[];
    remotePort: number;
    remoteAddress: string;
  }) {
    const { address, args, remotePort, remoteAddress } = params;

    const message = OscMessage.encode(address, args);
    return this.client.respond({
      msg: message,
      remoteAddress,
      remotePort,
    });
  }

  /** Add a listener to listen for all messages. */
  onAnyMessage<RT = Arg[]>(callBack: (event: OscMessageEvent<RT>) => void) {
    return this.eventEmitter.listen(EMIT_MESSAGE, callBack);
  }

  /** Add a listener to listen for any message once. */
  onOnceAnyMessage<RT = Arg[]>(callBack: (event: OscMessageEvent<RT>) => void) {
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
  onMessage<RT = Arg[]>(params: {
    address: string;
    callBack: (event: OscMessageEvent<RT>) => void;
  }) {
    return this.eventEmitter.listen(
      EMIT_MESSAGE,
      (event: OscMessageEvent<RT>) => {
        if (event.decoded.address === params.address) {
          params.callBack(event);
        }
      },
    );
  }

  /**
   * Add a listener to listen for a message with an address once.
   */
  onOnceMessage<RT = Arg[]>(params: {
    address: string;
    callBack: (event: OscMessageEvent<RT>) => void;
  }) {
    const cleanUp = this.eventEmitter.listen(
      EMIT_MESSAGE,
      (event: OscMessageEvent<RT>) => {
        if (event.decoded.address === params.address) {
          cleanUp();
          params.callBack(event);
        }
      },
    );
    return cleanUp;
  }

  /**
   * Wait for a message with an address.
   * Will return an error if does not get a message within 500 milliseconds.
   */
  async waitForMessage<RT = Arg[]>(params: {
    address: string;
    /** defaults to 500 */
    exitMs?: number;
  }): Promise<Result<OscMessageEvent<RT>, "wait-timeout">> {
    const resolver = new Promise<Result<OscMessageEvent<RT>, "wait-timeout">>(
      (resolve) => {
        const delayController = new AbortController();

        const cleanUp = this.onOnceMessage({
          address: params.address,
          callBack: (event: OscMessageEvent<RT>) => {
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
              message: `Too slow to reply on ${params.address}`,
              type: "wait-timeout",
            }),
          );
        });
      },
    );

    return resolver;
  }

  /** Send and wait for a message. */
  async sendAndWaitForMessage<RT = Arg[]>(params: {
    send: {
      address: string;
      args: Arg[];
    };
    listen: {
      address: string;
      exitMs?: number;
    };
  }) {
    const floatingPromise = this.waitForMessage<RT>({
      address: params.listen.address,
      exitMs: params.listen.exitMs,
    });
    await this.send(params.send);
    return floatingPromise;
  }
}
