import { RemoteInfo } from "dgram";
import { DecodedRrpControlMessage } from "../decoders/decodeAndPopRtpControl";
import { DecodedRrpClockMessage } from "../decoders/decodeAndPopRtpClock";
import { ExatlyOneKeyValue } from "./ExatlyOneKeyValueSet";

export type Command = "IN" | "OK" | "NO" | "BY" | "CK" | "FB";

export type AppleMIDICommand = "AppleMIDI";

export type RtpTimestamps =
  | [bigint]
  | [bigint, bigint]
  | [bigint, bigint, bigint];

/** Which UDP Port it should be on. */
export type OnTransport = "control" | "message";

export type MidiTransportEvent = {
  msg: Buffer<ArrayBufferLike>;
  decoded: ExatlyOneKeyValue<
    keyof DecodedMidiTransportMessage2,
    DecodedMidiTransportMessage2
  >;
  on: OnTransport;
  rinfo: RemoteInfo;
};

export type DecodedMidiTransportMessage =
  | {
      control: {
        header: Extract<Command, "OK" | "IN" | "BY" | "NO">;
      } & DecodedRrpControlMessage;
    }
  | {
      clock: {
        header: Extract<Command, "CK">;
      } & DecodedRrpClockMessage;
    }
  | {
      midi: {
        header: AppleMIDICommand;
      };
    }
  | {
      fallback: {
        header: Extract<Command, "FB">;
        uint8Array: Uint8Array<ArrayBuffer>;
      };
    };

export type MidiTransportMessageParams = {
  OK: {
    header: Extract<Command, "OK">; // Extract<Command, "OK" | "IN" | "BY" | "NO">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
    on: OnTransport;
  };

  IN: {
    header: Extract<Command, "IN">; // Extract<Command, "OK" | "IN" | "BY" | "NO">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
    on: OnTransport;
  };

  BY: {
    header: Extract<Command, "BY">; // Extract<Command, "OK" | "IN" | "BY" | "NO">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
    on: OnTransport;
  };
  NO: {
    header: Extract<Command, "NO">; // Extract<Command, "OK" | "IN" | "BY" | "NO">;
    version: number;
    token: number;
    ssrc: number;
    name: string;
    on: OnTransport;
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

export type MidiTransportMessageSendParams =
  | {
      control: {
        on: OnTransport;
        header: Extract<Command, "OK" | "IN" | "BY" | "NO">;
        version: number;
        token: number;
        ssrc: number;
        name: string;
      };
    }
  | {
      clock: {
        header: Extract<Command, "CK">;
        count: number;
        ssrc: number;
        timestamps: RtpTimestamps;
      };
    }
  | {
      midi: {
        header: AppleMIDICommand;
      };
    };

export type DecodedMidiTransportMessage2 = {
  OK: {
    header: Extract<Command, "OK" | "IN" | "BY" | "NO">;
  } & DecodedRrpControlMessage;

  IN: {
    header: Extract<Command, "OK" | "IN" | "BY" | "NO">;
  } & DecodedRrpControlMessage;

  BY: {
    header: Extract<Command, "OK" | "IN" | "BY" | "NO">;
  } & DecodedRrpControlMessage;

  NO: {
    header: Extract<Command, "OK" | "IN" | "BY" | "NO">;
  } & DecodedRrpControlMessage;

  CK: {
    header: Extract<Command, "CK">;
  } & DecodedRrpClockMessage;

  midi: {
    header: AppleMIDICommand;
  };

  FB: {
    header: Extract<Command, "FB">;
    uint8Array: Uint8Array<ArrayBuffer>;
  };
};
