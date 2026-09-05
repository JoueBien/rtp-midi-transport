import { intEncoder } from "@joue-bien/audio-transport";
import { BUFFER_PADDING } from "../constrains/headers";
import { RtpTimestamps } from "../types";

export function encodeRtpClock(params: {
  ssrc: number;
  timestamps: RtpTimestamps;
}) {
  const { ssrc, timestamps } = params;

  return new Uint8Array([
    // Encode SSRC
    ...intEncoder.encode(ssrc),
    // Encode no of timestamps in the message
    ...intEncoder.encode8Bit(timestamps.length),
    ...Uint8Array.from([BUFFER_PADDING.CONTROL]),
    ...Uint8Array.from([BUFFER_PADDING.CONTROL]),
    ...Uint8Array.from([BUFFER_PADDING.CONTROL]),
    // Encode timestamps
    ...Buffer.concat(timestamps.map((stamp) => intEncoder.encode64Bit(stamp))),
  ]);
}
