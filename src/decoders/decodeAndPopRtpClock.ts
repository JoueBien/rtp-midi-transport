import {
  decodeAndPopChars,
  decodeAndPopUnsignedInit,
  decodeAndPopUnsignedInit8Bit,
  decodeAndPopInt64Bit,
} from "@joue-bien/audio-transport";
import { RtpTimestamps } from "../types";

export type DecodedRrpClockMessage = {
  /** Count is zero indexed.
   * 0 = only one timestamp
   * 1 = two timestamps
   * 2 = three timestamps
   */
  count: number;
  ssrc: number;
  timestamps: RtpTimestamps;
  unit8Array: Uint8Array<ArrayBuffer>;
};

/** Decode and pop values for CK */
export function decodeAndPopRtpClock(unit8Array: Uint8Array<ArrayBuffer>) {
  const { unit8Array: unit8Array1, number: ssrc } =
    decodeAndPopUnsignedInit(unit8Array);

  const { number: count, unit8Array: unit8Array2 } =
    decodeAndPopUnsignedInit8Bit(unit8Array1);

  // Pop 3 bytes of padding
  const { unit8Array: unit8Array3 } = decodeAndPopChars(unit8Array2, 3);

  // Decode first timesmap
  const { number: timestamp0, unit8Array: unit8Array4 } =
    decodeAndPopInt64Bit(unit8Array3);

  const timestamps: RtpTimestamps = [timestamp0];
  const returnBuffer:
    | [Uint8Array<ArrayBuffer>]
    | [Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>]
    | [
        Uint8Array<ArrayBuffer>,
        Uint8Array<ArrayBuffer>,
        Uint8Array<ArrayBuffer>,
      ] = [unit8Array4];

  // Decode second timesmap
  if (count > 0) {
    const { number: timestamp1, unit8Array: unit8Array5 } =
      decodeAndPopInt64Bit(unit8Array4);
    timestamps.push(timestamp1);
    returnBuffer.push(unit8Array5);
    // Decode third timesmap
    if (count > 1) {
      const { number: timestamp2, unit8Array: unit8Array6 } =
        decodeAndPopInt64Bit(unit8Array5);
      timestamps.push(timestamp2);
      returnBuffer.push(unit8Array6);
    }
  }

  return {
    count,
    ssrc,
    timestamps: timestamps,
    unit8Array: returnBuffer[returnBuffer.length - 1],
  };
}
