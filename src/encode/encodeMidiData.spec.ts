import { stringEncoder } from "@joue-bien/audio-transport";
import { encodeMidiData } from "./encodeMidiData";
import { decodeAndPopMidiDataList } from "../decoders/decodeAndPopMidiData";

describe("encodeMidiData", () => {
  it("encodeMidiAnyChannel3Byte", () => {
    const res = encodeMidiData([
      {
        8: {
          channel: 5,
          command: 8,
          label: "NoteOff",
          data: [5, 6],
        },
      },
      {
        9: {
          channel: 5,
          command: 9,
          label: "NoteOn",
          data: [5, 6],
        },
      },
      {
        240: {
          command: 240,
          label: "SystemExclusiveStart",
          data: stringEncoder.encodeChars("hi"),
        },
      },
    ]);
    expect(res).toMatchObject(
      new Uint8Array([...[133, 5, 6], ...[149, 5, 6], ...[240, 104, 105, 247]]),
    );

    expect(
      decodeAndPopMidiDataList({
        unit8Array: res,
        messageByteLength: 10,
      }),
    ).toMatchObject({
      popped: 3,
      unit8Array: new Uint8Array(0),
      vaule: [
        {
          8: {
            channel: 5,
            command: 8,
            label: "NoteOff",
            data: [5, 6],
          },
        },
        {
          9: {
            channel: 5,
            command: 9,
            label: "NoteOn",
            data: [5, 6],
          },
        },
        {
          240: {
            command: 240,
            label: "SystemExclusiveStart",
            data: stringEncoder.encodeChars("hi"),
          },
        },
      ],
    });
  });
});
