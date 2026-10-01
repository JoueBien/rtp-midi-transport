import { decodeAndPopRtpMidi } from "./decodeAndPopRtpMidi";

describe("decodeAndPopRtpMidi", () => {
  it("decodes and encodes header", () => {
    const res = decodeAndPopRtpMidi(
      new Uint8Array([
        // 128, 97,
        160, 12, 0, 6, 90, 34, 100, 3, 160, 23, 3, 144, 24, 127,
      ]),
    );

    expect(res).toMatchObject({
      details: {
        sequence: 40972,
        timestamp: 416290,
        ssrc: 1677959191,
        messageByteLength: 3,
        journal: false,
        timestamps: false,
        runningStatus: false,
      },
      data: [
        {
          "9": {
            command: 9,
            channel: 0,
            label: "NoteOn",
            data: [24, 127],
          },
        },
      ],
      unit8Array: new Uint8Array(0),
      popped: 1,
    });
  });
});
