import { DecodedMidiTransportMessage, OnTransport } from "../types";
import { RemoteInfo } from "dgram";
import { ExactlyOneKeyValuePair } from "../types/ExactlyOneKeyValuePair";

export type MidiTransportInEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage["IN"];
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportClockEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage["CK"];
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportOkEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage["OK"];
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportByEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage["BY"];
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportNoEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage["NO"];
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportMidiEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage["midi"];
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportFbEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage["FB"];
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportAnyEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: ExactlyOneKeyValuePair<DecodedMidiTransportMessage>;
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportSpecificEvent<
  T extends keyof DecodedMidiTransportMessage,
> = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedMidiTransportMessage[T];
  on: OnTransport;
  rinfo: RemoteInfo;
};
