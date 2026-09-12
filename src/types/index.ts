import { RemoteInfo } from "dgram";
import { DecodedRrpControlMessage } from "../decoders/decodeAndPopRtpControl";
import { DecodedRrpClockMessage } from "../decoders/decodeAndPopRtpClock";

export type Command = "IN" | "OK" | "NO" | "BY" | "CK" | "FB";

export type AppleMIDICommand = "midi";

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

/** 
 * Deal with TS lack of inferance - this casts from specfic to an un-specific. 
 * Allowing us to set a specific type and return it in a function that return type is T.
 * 
 * @example
 ```ts
    function test<T extends keyof DecodedMidiTransportMessage>(
      command: T,
    ): MidiTransportEvent<T> {
      if (command === "IN") {
        const t = castMidiTransportEventToAll<T, "IN">({});
        return t;
      }
    }
 ```
*/
export function castMidiTransportEventToAll<
  T extends keyof DecodedMidiTransportMessage,
  E extends keyof DecodedMidiTransportMessage,
>(event: MidiTransportEvent<E>): MidiTransportEvent<T> {
  return event as unknown as MidiTransportEvent<T>;
}

export function castMidiTransportMessageParamsTo<
  E extends keyof MidiTransportMessageParams,
  T extends keyof MidiTransportMessageParams,
>(
  params: Pick<MidiTransportMessageParams, E>,
): Pick<MidiTransportMessageParams, T> {
  return params as unknown as Pick<MidiTransportMessageParams, T>;
}

export function castMidiTransportMessageSendParamsTo<
  E extends keyof MidiTransportMessageSendParams,
  T extends keyof MidiTransportMessageSendParams,
>(
  params: Pick<MidiTransportMessageSendParams, E>,
): Pick<MidiTransportMessageSendParams, T> {
  return params as unknown as Pick<MidiTransportMessageSendParams, T>;
}

// function test<T extends keyof DecodedMidiTransportMessage>(
//   command: T,
// ): MidiTransportEvent<T> {
//   if (command === "IN") {
//     const t = castMidiTransportEventToAll<T, "IN">({
//       msg: new Buffer(0),
//       decoded: {
//         IN: {
//           // Object literal may only specify known properties, and 'IN' does not exist in type 'Pick<DecodedMidiTransportMessage, T>'.
//           header: "IN",
//           version: 2,
//           token: 2,
//           ssrc: 2,
//           name: "string",
//           unit8Array: new Uint8Array(),
//         },
//         // "BY": {
//         //    header: "BY",
//         //   version: 2,
//         //   token: 2,
//         //   ssrc: 2,
//         //   name: "string",
//         //   unit8Array: new Uint8Array(),
//         // }
//       },
//       on: "control",
//       rinfo: {} as any,
//     });
//     return t;
//   }

//   return {} as any;
// }

// const tt = test("IN");

// tt.decoded.IN;

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
  };

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
