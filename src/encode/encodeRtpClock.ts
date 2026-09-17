import { unsignedIntEncoder, intEncoder } from "@joue-bien/audio-transport";
import { BUFFER_PADDING } from "../constrains/headers";
import { RtpTimestamps } from "../types";

export function encodeRtpClock(params: {
  ssrc: number;
  /** timestamps is zero indexed when encoded into count.
   * 0 = only one timestamp
   * 1 = two timestamps
   * 2 = three timestamps
   */
  timestamps: RtpTimestamps;
}) {
  const { ssrc, timestamps } = params;

  return new Uint8Array([
    // Encode SSRC
    ...unsignedIntEncoder.encode(ssrc),
    /** Encode no of timestamps in the message
     *  Count is zero indexed.
     * 0 = only one timestamp
     * 1 = two timestamps
     * 2 = three timestamps
     */
    ...unsignedIntEncoder.encode8Bit(timestamps.length - 1),
    ...Uint8Array.from([BUFFER_PADDING.NULL]),
    ...Uint8Array.from([BUFFER_PADDING.NULL]),
    ...Uint8Array.from([BUFFER_PADDING.NULL]),
    // Encode timestamps
    ...Buffer.concat(
      // TODO: Make unsigned
      timestamps.map((stamp) => intEncoder.encode64Bit(stamp)),
    ),
  ]);
}
