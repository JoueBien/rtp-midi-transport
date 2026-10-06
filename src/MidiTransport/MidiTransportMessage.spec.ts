import { unsignedIntEncoder, timestamp } from "@joue-bien/audio-transport";
import { MidiTransportMessage } from "./MidiTransportMessage";
import { encodeRtpHeader } from "./../encode/encodeRtpHeader";

describe("MidiTransportMessage", () => {
  it("encodes and decodes commands", () => {
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
      MidiTransportMessage.encode({
        midi: {
          header: "midi",
          sequence: 40979,
          timestamp: 420710,
          ssrc: 1677959191,
          data: [
            {
              "9": {
                command: 9,
                channel: 0,
                label: "NoteOn",
                data: [24, 0],
              },
            },
          ],
        },
      }),
      // new Uint8Array([
      //   // CH 2 Button on, o valocity
      //   // 128, 97, 160, 19, 0, 6, 107, 102, 100, 3, 160, 23, 3, 145, 24, 0,

      //   // CH 1 Button on, o valocity
      //   128, 97, 160, 19, 0, 6, 107, 102, 100, 3, 160, 23, 3, 144, 24, 0,
      // ]),
    );

    expect(res).toMatchObject({
      midi: {
        header: "midi",
        journal: false,
        messageByteLength: 3,
        runningStatus: false,
        sequence: 40979,
        ssrc: 1677959191,
        timestamp: 420710,
        timestamps: false,
        data: [
          {
            "9": {
              command: 9,
              channel: 0,
              label: "NoteOn",
              data: [24, 0],
            },
          },
        ],
        unit8Array: new Uint8Array(0),
        popped: 1,
      },
    });
  });

  it("encodes and decodes system exclusive midi messages and Note On", () => {
    const res = MidiTransportMessage.decode(
      new Uint8Array([
        // SYS X "hi"
        128, 97, 160, 19, 0, 6, 107, 102, 100, 3, 160, 23, 7, 240, 104, 105,
        247, 144, 24, 0,
      ]),
    );

    expect(res).toMatchObject({
      midi: {
        header: "midi",
        sequence: 40979,
        timestamp: 420710,
        ssrc: 1677959191,
        messageByteLength: 7,
        journal: false,
        timestamps: false,
        runningStatus: false,
        data: [
          {
            240: {
              command: 240,
              data: Uint8Array.from([104, 105]),
              label: "SystemExclusiveStart",
            },
          },
          {
            9: {
              channel: 0,
              command: 9,
              data: [24, 0],
              label: "NoteOn",
            },
          },
        ],
      },
    });
  });
});
