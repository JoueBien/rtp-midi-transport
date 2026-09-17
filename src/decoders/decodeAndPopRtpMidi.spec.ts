import { decodeAndPopRtpMidi } from "./decodeAndPopRtpMidi";

describe("decodeAndPopRtpMidi", () => {
  it("decodes and encodes header", () => {
    const res = decodeAndPopRtpMidi(
      new Uint8Array([
        // 128, 97,
        160, 12, 0, 6, 90, 34, 100, 3, 160, 23, 3, 144, 24, 127,
      ]),
    );
    console.log("@@@res", JSON.stringify(res, null, 2));
  });
});
