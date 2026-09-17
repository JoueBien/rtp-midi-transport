import { RemoteInfo } from "dgram";
import { DecodedRrpControlMessage } from "../decoders/decodeAndPopRtpControl";
import { DecodedRrpClockMessage } from "../decoders/decodeAndPopRtpClock";
import { DecodedRrpMidiMessage } from "../decoders/decodeAndPopRtpMidi";

export type Command = "IN" | "OK" | "NO" | "BY" | "CK" | "FB";

export type AppleMIDICommand = "midi";

/** Timestamp order of newest is [2, 1, 0]. */
export type RtpTimestamps =
  | [bigint]
  | [bigint, bigint]
  | [bigint, bigint, bigint];

/** Which UDP Port it should be on. */
export type OnTransport = "control" | "message";

export type MidiTransportEvent<T extends keyof DecodedMidiTransportMessage> = {
  msg: Buffer<ArrayBufferLike>;
  decoded: Pick<DecodedMidiTransportMessage, T>;
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type MidiTransportUnknownEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: Partial<DecodedMidiTransportMessage>;
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type DecodedMidiTransportMessage = {
  OK: {
    header: Extract<Command, "OK">;
  } & DecodedRrpControlMessage;

  IN: {
    header: Extract<Command, "IN">;
  } & DecodedRrpControlMessage;

  BY: {
    header: Extract<Command, "BY">;
  } & DecodedRrpControlMessage;

  NO: {
    header: Extract<Command, "NO">;
  } & DecodedRrpControlMessage;

  CK: {
    header: Extract<Command, "CK">;
  } & DecodedRrpClockMessage;

  midi: {
    header: AppleMIDICommand;
  } & DecodedRrpMidiMessage;

  FB: {
    header: Extract<Command, "FB">;
    uint8Array: Uint8Array<ArrayBuffer>;
  };
};

export type MidiTransportMessageParams = {
  OK: {
    header: Extract<Command, "OK">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };

  IN: {
    header: Extract<Command, "IN">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };

  BY: {
    header: Extract<Command, "BY">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };
  NO: {
    header: Extract<Command, "NO">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };

  CK: {
    header: Extract<Command, "CK">;
    count: number;
    ssrc: number;
    timestamps: RtpTimestamps;
  };

  midi: {
    header: AppleMIDICommand;
  };
};

export type MidiTransportMessageSendParams = {
  OK: {
    on: OnTransport;
    header: Extract<Command, "OK">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };

  IN: {
    on: OnTransport;
    header: Extract<Command, "IN">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };

  BY: {
    on: OnTransport;
    header: Extract<Command, "BY">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };
  NO: {
    on: OnTransport;
    header: Extract<Command, "NO">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
  };

  CK: {
    header: Extract<Command, "CK">;
    count: number;
    ssrc: number;
    timestamps: RtpTimestamps;
  };

  midi: {
    header: AppleMIDICommand;
  };
};
