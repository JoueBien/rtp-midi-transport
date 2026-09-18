import { unsignedIntEncoder, timestamp } from "@joue-bien/audio-transport";
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
        ...unsignedIntEncoder.encode(version),
        ...unsignedIntEncoder.encode(token),
        ...unsignedIntEncoder.encode(ssrc),
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

  // new Uint8Array([
  //       // 128, 97,
  //       160, 12, 0, 6, 90, 34, 100, 3, 160, 23, 3, 144, 24, 127,
  //     ]),

  it("encodes and decodes clocks", () => {
    const now = timestamp.nowRTP64Bit();
    const res = MidiTransportMessage.decode(
      MidiTransportMessage.encode({
        CK: {
          header: "CK",
          count: 0,
          ssrc: 123123123,
          timestamps: [now],
        },
      }),
    );

    expect(res).toMatchObject({
      CK: {
        header: "CK",
        count: 0,
        ssrc: 123123123,
        timestamps: [now],
        unit8Array: expect.any(Uint8Array),
      },
    });
  });

  it("encodes and decodes midi messages", () => {
    const res = MidiTransportMessage.decode(
      new Uint8Array([
        // CH 2 Button on, o valocity
        128, 97, 160, 19, 0, 6, 107, 102, 100, 3, 160, 23, 3, 145, 24, 0,

        // CH 1 Button on, o valocity
        // 128, 97, 160, 19, 0, 6, 107, 102, 100, 3, 160, 23, 3, 144, 24, 0,
      ]),
    );

    expect(res).toMatchObject({
      midi: {
        header: "midi",
        details: {
          journal: false,
          messageByteLength: 3,
          runningStatus: false,
          sequence: 40979,
          ssrc: 1677959191,
          timestamp: 420710,
          timestamps: false,
        },
        data: {},
      },
    });
  });
});
