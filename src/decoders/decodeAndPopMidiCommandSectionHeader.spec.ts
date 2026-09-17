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

  it("encodes and decodes a short header with timestamps", () => {
    const encoded = encodeMidiCommandSectionHeader({
      journal: false,
      timestamps: true,
      runningStatus: false,
      messageByteLength: 15,
    });

    const res = decodeAndPopMidiCommandSectionHeader(encoded);

    expect(res).toMatchObject({
      journal: false,
      timestamps: true,
      runningStatus: false,
      messageByteLength: 15,
    });
  });

  it("encodes and decodes a short header from the X-touch", () => {
    const res = decodeAndPopMidiCommandSectionHeader(
      new Uint8Array([
        // 128, 97, 160, 12, 0, 6, 90, 34, 100,
        3, 160, 23, 3, 144, 24, 127,
      ]),
    );

    expect(res).toMatchObject({
      journal: false,
      timestamps: false,
      runningStatus: false,
      messageByteLength: 3,
    });
  });
});
