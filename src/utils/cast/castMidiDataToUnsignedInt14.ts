import {
  decodeAndPopUnsignedInit16Bit,
  SBitsArray,
} from "@joue-bien/audio-transport";

/** Decode two midi data points into a single int. Commonly used for fader vaules. */
export function castMidiDataToUnsignedInt14(input: [number, number]) {
  const rawBits = SBitsArray.from(Uint8Array.from(input));
  const bits = new SBitsArray(0);

  for (let i = 0; i < rawBits.length; i++) {
    if (i % 8 !== 0) {
      bits.push(rawBits[i]);
    }
  }

  bits.alignBytes();

  const { number } = decodeAndPopUnsignedInit16Bit(bits.unit8Array);
  return number;
}
