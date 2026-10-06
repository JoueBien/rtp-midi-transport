import { castUnsignedInt14ToMidiData } from "./castUnsignedInt14ToMidiData";
import { castMidiDataToUnsignedInt14 } from "./castMidiDataToUnsignedInt14";

describe("castInt14ToMidiData", () => {
  it("encodes and decodes 14 bit numbers", () => {
    const res = castMidiDataToUnsignedInt14(castUnsignedInt14ToMidiData(16383));
    expect(res).toBe(16383);
  });

  it("encodes and decodes 14 bit numbers when number is larger - wraps around", () => {
    const res = castMidiDataToUnsignedInt14(castUnsignedInt14ToMidiData(16385));
    expect(res).toBe(1);
  });
});
