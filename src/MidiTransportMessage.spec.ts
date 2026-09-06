import { intEncoder, timestamp } from "@joue-bien/audio-transport";
import { MidiTransportMessage } from "./MidiTransportMessage";
import { encodeRtpHeader } from "./encode/encodeRtpHeader";

describe("MidiTransportMessage", () => {
  it("encodes and decodes commnds", () => {
    const res = MidiTransportMessage.decode(
      MidiTransportMessage.encode({
        BY: {
          header: "BY",
          name: "Test Touch",
          ssrc: 123123123,
          token: 123334324,
          version: 2,
          on: "control",
        },
      }),
    );

    expect(res).toMatchObject({
      BY: {
        header: "BY",
        name: "Test Touch",
        ssrc: 123123123,
        token: 123334324,
        version: 2,
        unit8Array: expect.any(Uint8Array),
      },
    });
  });

  it("encodes and decodes BY with no nme", () => {
    const version = 2;
    const token = 123334324;
    const ssrc = 123123123;

    const res = MidiTransportMessage.decode(
      new Uint8Array([
        ...encodeRtpHeader({ command: "BY" }),
        ...intEncoder.encode(version),
        ...intEncoder.encode(token),
        ...intEncoder.encode(ssrc),
      ]),
    );

    expect(res).toMatchObject({
      BY: {
        header: "BY",
        name: "",
        ssrc: 123123123,
        token: 123334324,
        version: 2,
        unit8Array: expect.any(Uint8Array),
      },
    });
  });

  it("encodes and decodes clocks", () => {
    const now = timestamp.nowRTP();
    const res = MidiTransportMessage.decode(
      MidiTransportMessage.encode({
        CK: {
          header: "CK",
          count: 1,
          ssrc: 123123123,
          timestamps: [now],
        },
      }),
    );

    expect(res).toMatchObject({
      CK: {
        header: "CK",
        count: 1,
        ssrc: 123123123,
        timestamps: [now],
        unit8Array: expect.any(Uint8Array),
      },
    });
  });
});
