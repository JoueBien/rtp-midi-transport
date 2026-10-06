import { intEncoder, SBitsArray } from "@joue-bien/audio-transport";

/** Encode a inot into two midi data. Commonly used for fader values. */
export function castUnsignedInt14ToMidiData(num: number): [number, number] {
  const unit8Array = intEncoder.encode16Bit(num);

  const bits = SBitsArray.from(unit8Array);

  const d1 = SBitsArray.fromSBits(bits.slice(16 - 14, 16 - 7));
  d1.alignBytes();

  const d2 = SBitsArray.fromSBits(bits.slice(16 - 7, 16));
  d2.alignBytes();

  return [Number(d1.unit8Array[0]), Number(d2.unit8Array[0])];
}
