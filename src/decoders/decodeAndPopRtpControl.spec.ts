import { expect, describe, it } from "vitest";
import { encodeRtpControl } from "../encode/encodeRtpControl.ts";
import { decodeAndPopRtpControl } from "./decodeAndPopRtpControl.ts";

describe("decodeAndPopRtpControl", () => {
  it("decodes an encodes value", () => {
    const res = decodeAndPopRtpControl(
      encodeRtpControl({
        version: 2,
        token: 568900,
        ssrc: 100232,
        name: "Custom Z-Touch Midi",
      }),
    );

    expect(res).toMatchObject({
      version: 2,
      token: 568900,
      ssrc: 100232,
      name: "Custom Z-Touch Midi",
      unit8Array: expect.any(Uint8Array),
    });
  });
});
