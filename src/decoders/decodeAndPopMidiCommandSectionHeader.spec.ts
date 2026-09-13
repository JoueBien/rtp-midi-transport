import { SBitsArray } from "@joue-bien/audio-transport";
import { encodeMidiCommandSectionHeader } from "../encode/encodeMidiCommandSectionHeader";
import { decodeAndPopMidiCommandSectionHeader } from "./decodeAndPopMidiCommandSectionHeader";

describe("decodeAndPopMidiCommandSectionHeader", () => {
  it("encodes and decodes a long header", () => {
    const encoded = encodeMidiCommandSectionHeader({
      journal: true,
      timestamps: true,
      runningStatus: true,
      messageByteLength: 200,
    });

    const res = decodeAndPopMidiCommandSectionHeader(encoded);

    expect(res).toMatchObject({
      journal: true,
      timestamps: true,
      runningStatus: true,
      messageByteLength: 200,
    });
  });

  it("encodes and decodes a short header", () => {
    const encoded = encodeMidiCommandSectionHeader({
      journal: false,
      timestamps: false,
      runningStatus: false,
      messageByteLength: 15,
    });

    const res = decodeAndPopMidiCommandSectionHeader(encoded);

    expect(res).toMatchObject({
      journal: false,
      timestamps: false,
      runningStatus: false,
      messageByteLength: 15,
    });
  });
});
