import { expect, describe, it } from "vitest";
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

  it("encodes and decodes BY with no name", () => {
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
              8: {
                command: 8,
                channel: 0,
                label: "NoteOff",
                data: [24, 1],
              },
            },
            {
              9: {
                command: 9,
                channel: 1,
                label: "NoteOn",
                data: [24, 2],
              },
            },
            {
              10: {
                command: 10,
                channel: 2,
                label: "PolyphonicAftertouch",
                data: [24, 3],
              },
            },
            {
              11: {
                command: 11,
                channel: 3,
                label: "ControlChange",
                data: [24, 4],
              },
            },
            {
              12: {
                command: 12,
                channel: 4,
                label: "ProgramChange",
                data: [24],
              },
            },
            {
              13: {
                command: 13,
                channel: 5,
                label: "ChannelAftertouch",
                data: [24],
              },
            },
            {
              14: {
                command: 14,
                channel: 6,
                label: "PitchBend",
                data: [24, 5],
              },
            },
            {
              241: {
                command: 241,
                label: "TimeCodeQuarterFrame",
                data: [24],
              },
            },
            {
              242: {
                command: 242,
                label: "SongPositionPointer",
                data: [24, 6],
              },
            },
            {
              243: {
                command: 243,
                label: "SongSelect",
                data: [24],
              },
            },
            {
              246: {
                command: 246,
                label: "TuneRequest",
              },
            },
            {
              248: {
                command: 248,
                label: "TimingClock",
              },
            },
            {
              250: {
                command: 250,
                label: "Start",
              },
            },
            {
              251: {
                command: 251,
                label: "Continue",
              },
            },
            {
              252: {
                command: 252,
                label: "Stop",
              },
            },
            {
              254: {
                command: 254,
                label: "ActiveSensing",
              },
            },
            {
              255: {
                command: 255,
                label: "SystemReset",
              },
            },
            {
              244: {
                command: 244,
                label: "Undefined",
              },
            },
            {
              245: {
                command: 245,
                label: "Undefined",
              },
            },
            {
              249: {
                command: 249,
                label: "Undefined",
              },
            },
            {
              253: {
                command: 253,
                label: "Undefined",
              },
            },
          ],
        },
      }),
    );

    expect(res).toMatchObject({
      midi: {
        header: "midi",
        journal: false,
        messageByteLength: 37,
        runningStatus: false,
        sequence: 40979,
        ssrc: 1677959191,
        timestamp: 420710,
        timestamps: false,
        data: [
          {
            8: {
              command: 8,
              channel: 0,
              label: "NoteOff",
              data: [24, 1],
            },
          },
          {
            9: {
              command: 9,
              channel: 1,
              label: "NoteOn",
              data: [24, 2],
            },
          },
          {
            10: {
              command: 10,
              channel: 2,
              label: "PolyphonicAftertouch",
              data: [24, 3],
            },
          },
          {
            11: {
              command: 11,
              channel: 3,
              label: "ControlChange",
              data: [24, 4],
            },
          },
          {
            12: {
              command: 12,
              channel: 4,
              label: "ProgramChange",
              data: [24],
            },
          },
          {
            13: {
              command: 13,
              channel: 5,
              label: "ChannelAftertouch",
              data: [24],
            },
          },
          {
            14: {
              command: 14,
              channel: 6,
              label: "PitchBend",
              data: [24, 5],
            },
          },
          {
            241: {
              command: 241,
              label: "TimeCodeQuarterFrame",
              data: [24],
            },
          },
          {
            242: {
              command: 242,
              label: "SongPositionPointer",
              data: [24, 6],
            },
          },
          {
            243: {
              command: 243,
              label: "SongSelect",
              data: [24],
            },
          },
          {
            246: {
              command: 246,
              label: "TuneRequest",
            },
          },
          {
            248: {
              command: 248,
              label: "TimingClock",
            },
          },
          {
            250: {
              command: 250,
              label: "Start",
            },
          },
          {
            251: {
              command: 251,
              label: "Continue",
            },
          },
          {
            252: {
              command: 252,
              label: "Stop",
            },
          },
          {
            254: {
              command: 254,
              label: "ActiveSensing",
            },
          },
          {
            255: {
              command: 255,
              label: "SystemReset",
            },
          },
          {
            244: {
              command: 244,
              label: "Undefined",
            },
          },
          {
            245: {
              command: 245,
              label: "Undefined",
            },
          },
          {
            249: {
              command: 249,
              label: "Undefined",
            },
          },
          {
            253: {
              command: 253,
              label: "Undefined",
            },
          },
        ],
        unit8Array: new Uint8Array(0),
        popped: 21,
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
