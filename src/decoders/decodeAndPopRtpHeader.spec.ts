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
});
