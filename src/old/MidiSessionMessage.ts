import {
  decodeAndPopChars,
  decodeAndPopInit,
  decodeAndPopInit8Bit,
  decodeAndPopInt64Bit,
  decodeAndPopTerminatedString,
  intEncoder,
  stringEncoder,
  timestamp,
} from "@joue-bien/audio-transport";
import { type Command } from "./../types";

// export const connectPadding = Buffer.concat([
//   intEncoder.encode8Bit(255), // Padding
//   intEncoder.encode8Bit(255), // Padding
//   Buffer.from(stringEncoder.encodeChars("IN")), // Command
//   intEncoder.encode(2).reverse(), // Protocol Version no
//   intEncoder.encode(124), // Random initiator token
//   intEncoder.encode(1003), // SSRC - self identifier
//   Buffer.from(stringEncoder.encodeChars("ZRXX")),
// ]);

const BUFFER_PADDING = {
  /** 11111111 */
  CONTROL: Uint8Array.from([0xff]),
  NULL: 0x00,
};

export function checkCommand(str: string | Command): Command {
  switch (str) {
    case "OK":
      return str;
    case "IN":
      return str;
    case "NO":
      return str;
    case "BY":
      return str;
    case "CK":
      return str;
    default:
      "FB";
  }
  return "FB";
}

export type DecodedSessionMessage = {
  // FB is not part of the spec - it notes a failure to decode and a value was fallen back to
  command: "IN" | "OK" | "NO" | "BY" | "CK" | "FB";
  version: number;
  token: number;
  ssrc: number;
  name: string;
};

export type DecodedSessionTimestampMessage = {
  command: "CK";
  count: number;
  timestamps: [bigint] | [bigint, bigint] | [bigint, bigint, bigint]; // [bigint, bigint | undefined, bigint | undefined];
};

export const MidiSessionMessage = {
  // TODO: generate SRC & Random Token
  // TODO: encode & decode name correctly
  control: {
    encode(params: { command: "IN" | "OK" | "NO"; name: string }) {
      const { command, name } = params;
      return Buffer.concat([
        // Padding & Command
        BUFFER_PADDING.CONTROL,
        BUFFER_PADDING.CONTROL,
        stringEncoder.encodeChars(command),
        // Protocol Version no
        intEncoder.encode(2),
        // Random initiator token
        intEncoder.encode(124),
        // SSRC - self identifier
        intEncoder.encode(1003),
        // Name
        stringEncoder.encodeTerminated(name),
      ]);
    },

    encodeTimestamp(
      // performance.now() * 100
      params: {
        timestamps: [bigint] | [bigint, bigint] | [bigint, bigint, bigint]; /// [bigint, bigint | undefined, bigint | undefined];
      },
    ) {
      const { timestamps } = params;
      return Buffer.concat([
        // Padding & Command
        BUFFER_PADDING.CONTROL,
        BUFFER_PADDING.CONTROL,
        stringEncoder.encodeChars("CK"),
        // Count and 64bit ints
        intEncoder.encode8Bit(timestamps.length - 1),
        BUFFER_PADDING.CONTROL,
        BUFFER_PADDING.CONTROL,
        BUFFER_PADDING.CONTROL,
        // Map 1-3 time stamps.
        Buffer.concat(timestamps.map((stamp) => intEncoder.encode64Bit(stamp))),
      ]);
    },

    decodeTimestamp(
      messageBuffer: Uint8Array<ArrayBuffer>,
    ): DecodedSessionTimestampMessage {
      const { unit8Array: buf1 } = decodeAndPopInit8Bit(
        Uint8Array.from(messageBuffer),
      );
      const { unit8Array: buf2 } = decodeAndPopInit8Bit(buf1);

      const { str: command, unit8Array: buf3 } = decodeAndPopChars(buf2, 2);

      const { number: count, unit8Array: buf4 } = decodeAndPopInit8Bit(buf3);

      const { unit8Array: buf5 } = decodeAndPopChars(buf4, 3);

      // Decode timestamp bits START.
      const { number: timestamp0, unit8Array: buf6 } =
        decodeAndPopInt64Bit(buf5);

      let timestamps: [bigint] | [bigint, bigint] | [bigint, bigint, bigint] = [
        timestamp0,
      ];

      if (count > 0) {
        const { number: timestamp1, unit8Array: buf7 } =
          decodeAndPopInt64Bit(buf6);
        timestamps.push(timestamp1);
        if (count > 1) {
          const { number: timestamp2 } = decodeAndPopInt64Bit(buf7);
          timestamps.push(timestamp2);
        }
      }
      // Decode timestamp bits END.

      return {
        command: command === "CK" ? command : "CK",
        count,
        timestamps: timestamps,
      };
    },

    decode(messageBuffer: Uint8Array<ArrayBuffer>): DecodedSessionMessage {
      const { unit8Array: buf1 } = decodeAndPopInit8Bit(
        Uint8Array.from(messageBuffer),
      );
      const { unit8Array: buf2 } = decodeAndPopInit8Bit(buf1);

      const { str: command, unit8Array: buf3 } = decodeAndPopChars(buf2, 2);

      const { number: version, unit8Array: buf4 } = decodeAndPopInit(buf3);

      const { number: token, unit8Array: buf5 } = decodeAndPopInit(buf4);

      const { number: ssrc, unit8Array: buf6 } = decodeAndPopInit(buf5);

      const { str: name } = decodeAndPopTerminatedString(buf6);

      return {
        command: checkCommand(command),
        version,
        token,
        ssrc,
        name,
      };
    },
  },
};
