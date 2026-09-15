import { encodeRtpHeader } from "../encode/encodeRtpHeader";
import { decodeAndPopRtpHeader } from "./decodeAndPopRtpHeader";

describe("decodeAndPopRtpHeader", () => {
  it("decodes an IN Header", () => {
    const res = decodeAndPopRtpHeader(
      encodeRtpHeader({
        command: "IN",
      }),
    );

    expect(res).toMatchObject({
      command: "IN",
      unit8Array: expect.any(Uint8Array),
    });
  });

  it("decodes an Apple Midi Header", () => {
    const res = decodeAndPopRtpHeader(
      encodeRtpHeader({
        command: "midi",
      }),
    );

    expect(res).toMatchObject({
      command: "midi",
      unit8Array: expect.any(Uint8Array),
    });
  });

  it("decodes an Apple Midi Header from an X-Touch which doesn't respect the Marker (M) value", () => {
    const res = decodeAndPopRtpHeader(
      new Uint8Array([
        128, 97, 160, 19, 0, 6, 107, 102, 100, 3, 160, 23, 3, 144, 24, 0,
      ]),
    );

    expect(res).toMatchObject({
      command: "midi",
      unit8Array: expect.any(Uint8Array),
    });
  });
});
