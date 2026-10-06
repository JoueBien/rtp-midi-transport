import {
  counterFactory,
  EventEmitterController,
  UdpTransport,
} from "@joue-bien/audio-transport";
import { Failure, Result } from "fail-up";
import {
  DecodedMidiTransportMessage,
  MidiTransportMessageSendParams,
  MidiTransportMessageRespondParams,
  MidiTransportUnknownEvent,
} from "../types";
import {} from "../constrains/message";
import {
  MidiTransportAnyEvent,
  MidiTransportSpecificEvent,
} from "../types/events";

export interface MidiTransportLike {
  controlClient: UdpTransport;
  messageClient: UdpTransport;
  eventEmitter: EventEmitterController;
  cleanUpController: AbortController;
  hardwareName: string;
  getNextSSRCNumber: ReturnType<typeof counterFactory>;
  getNextCounterNumber: ReturnType<typeof counterFactory>;
  getNextTokenNumber: ReturnType<typeof counterFactory>;
  token: number;
  ssrc: number;

  // State Checks.
  isListeningOk(): Promise<Result<"ok", "aborted" | "not-listening">>;
  isConnectionOk(): Promise<Result<"ok", "aborted" | "not-connected">>;

  // Start connections.
  connect(): Promise<
    Result<AbortController, "connection-failed" | "connection-no">
  >;
  listen(): Promise<Result<AbortController, "listen-failed">>;

  // Clean up.
  deconstructor(): void;

  // Send messages.
  send<T extends keyof MidiTransportMessageSendParams>(
    msg: Pick<MidiTransportMessageSendParams, T>,
  ): Promise<Result<"ok", "aborted" | "not-connected" | "send-failure">>;
  respond<T extends keyof MidiTransportMessageRespondParams>(params: {
    msg: Pick<MidiTransportMessageRespondParams, T>;
    to: {
      remotePort: number;
      remoteAddress: string;
    };
  }): Promise<Result<"ok", "aborted" | "not-listening" | "send-failure">>;

  // Handle events generic.
  onAnyMessage(callBack: (event: MidiTransportAnyEvent) => void): () => void;
  onOnceAnyMessage(
    callBack: (event: MidiTransportAnyEvent) => void,
  ): () => void;

  // Handle specific message.
  onMessage<T extends keyof DecodedMidiTransportMessage>(params: {
    command: T;
    callBack: (event: MidiTransportSpecificEvent<T>) => void;
  }): () => void;
  onOnceMessage<T extends keyof DecodedMidiTransportMessage>(params: {
    command: T;
    callBack: (event: MidiTransportSpecificEvent<T>) => void;
  }): () => void;
  waitForMessage<T extends keyof DecodedMidiTransportMessage>(params: {
    command: T;
    exitMs?: number;
  }): Promise<Result<MidiTransportSpecificEvent<T>, "wait-timeout">>;
  sendAndWaitForMessage<
    T extends keyof MidiTransportMessageSendParams,
    Ret extends keyof MidiTransportMessageSendParams,
  >(params: {
    send: Pick<MidiTransportMessageSendParams, T>;
    listen: {
      command: Ret;
      exitMs?: number;
    };
  }): Promise<Result<MidiTransportSpecificEvent<Ret>, "wait-timeout">>;

  // Handle errors.
  onError(callBack: (err: Failure<"on-error">) => void): () => void;
  onOnceError(callBack: (err: Failure<"on-error">) => void): () => void;
}
