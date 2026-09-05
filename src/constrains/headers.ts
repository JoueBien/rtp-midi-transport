import { SBitsArray } from "@joue-bien/audio-transport";

/**
 * Apples MIDI Packets
 * V   P  X  CC    M  PT
 * 10  0  0  CCCC  1  1100001
 */
export const APPLE_MIDI_HEADER = SBitsArray.from(["10000000", "11100001"]);

/** Padding for each command RTP controll packets. */
export const RTP_HEADER_PADDING = SBitsArray.from(["11111111", "11111111"]);

export const BUFFER_PADDING = {
  /** 11111111 */
  CONTROL: 0xff,
  NULL: 0x00,
};
