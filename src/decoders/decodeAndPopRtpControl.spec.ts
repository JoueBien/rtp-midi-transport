import { encodRtpControl } from "../encode/encodRtpControl";
import { decodeAndPopRtpControl } from "./decodeAndPopRtpControl";

describe("decodeAndPopRtpControl", () => {
  it("decodes an encooded value", () => {
    const res = decodeAndPopRtpControl(
      encodRtpControl({
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
