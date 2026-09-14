import { encodeRtpClock } from "../encode/encodeRtpClock";
import { RtpTimestamps } from "../types";
import { decodeAndPopRtpClock } from "./decodeAndPopRtpClock";
import { timestamp } from "@joue-bien/audio-transport";

describe("decodeAndPopRtpClock", () => {
  it("encodes and decodes clock values", () => {
    const times: RtpTimestamps = [
      timestamp.nowRTP(),
      timestamp.nowRTP(),
      timestamp.nowRTP(),
    ];

    const res = decodeAndPopRtpClock(
      encodeRtpClock({
        ssrc: 1312312332,
        timestamps: times,
      }),
    );

    expect(res).toMatchObject({
      ssrc: 1312312332,
      count: 2,
      timestamps: times,
      unit8Array: expect.any(Uint8Array),
    });
  });

  it("encodes and decodes a single clock value", () => {
    const times: RtpTimestamps = [timestamp.nowRTP()];

    const res = decodeAndPopRtpClock(
      encodeRtpClock({
        ssrc: 1312312332,
        timestamps: times,
      }),
    );

    expect(res).toMatchObject({
      ssrc: 1312312332,
      count: 0,
      timestamps: times,
      unit8Array: expect.any(Uint8Array),
    });
  });
});
