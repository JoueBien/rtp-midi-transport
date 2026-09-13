import {
  decodeAndPopBytes,
  decodeAndPopInit8Bit,
  SBitsArray,
  decodeAndPopInit16Bit,
} from "@joue-bien/audio-transport";

/**
 * Creates a midi list header.
   0                   1                   2                   3
   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |B|J|Z|P|LEN... |  MIDI list ...                                |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */
export type DecodeMidiCommandSectionHeader = {
  /** | LEN |
   * Size of the midi list message in bytes. This also sets | B |
   * | B | - 0 or 1
   * "short" (0) the headers Len field is 4 bits long and the message can be up to 15 bytes.
   * "long" (1) the headers Len is a 12 bits long and the message can be up to 4095 bytes long.
   * In the short mode the header is 8 bits long.
   * In the long mode the header is 16 bits long. */
  messageByteLength: number;
  /**
   * | J |
   * true (1) journal should be included.
   * false (0) journal should be excluded.
   * Note there is no encode or decode journal support. */
  journal: boolean;
  /** | Z |
   * true - denotes if the midi list includes 4 byte timestamps before each Midi command in the MIDI List.
   * (1-4 octets long, or 0 octets if Z = 0).*/
  timestamps: boolean;
  /**
   * | P |
   * Original used midi repeate command. */
  runningStatus: boolean;
  /** The rest of the message incuding the midi and journal section. */
  unit8Array: Uint8Array<ArrayBuffer>;
};

/**
 * Reads and pops a midi list header.
   0                   1                   2                   3
   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |B|J|Z|P|LEN... |  MIDI list ...                                |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */
export function decodeAndPopMidiCommandSectionHeader(
  unit8Array: Uint8Array<ArrayBuffer>,
): DecodeMidiCommandSectionHeader {
  // Decpde and pop both short and long.
  const { unit8Array: unit8ArrayShort } = decodeAndPopBytes(unit8Array, 1);
  const { bytes: longHeader, unit8Array: unit8ArrayLong } = decodeAndPopBytes(
    unit8Array,
    2,
  );

  // Use the long for working on the header.
  const headerBits = SBitsArray.from(longHeader);
  const isTwoBytesLong = headerBits[0] === "1" ? true : false;

  // Handel decoding long header
  if (isTwoBytesLong) {
    const lenBits = SBitsArray.fromSBits(headerBits.slice(16 - 12, 16));
    lenBits.alignBytes();

    const { number } = decodeAndPopInit16Bit(lenBits.unit8Array);
    return {
      messageByteLength: number,
      journal: headerBits[1] === "1" ? true : false,
      timestamps: headerBits[2] === "1" ? true : false,
      runningStatus: headerBits[3] === "1" ? true : false,
      unit8Array: unit8ArrayLong,
    };
  }

  // Handel decoding short header.
  const lenBits = SBitsArray.fromSBits(headerBits.slice(8 - 4, 8));
  lenBits.alignBytes();

  const { number } = decodeAndPopInit8Bit(lenBits.unit8Array);

  return {
    messageByteLength: number,
    journal: headerBits[1] === "1" ? true : false,
    timestamps: headerBits[2] === "1" ? true : false,
    runningStatus: headerBits[3] === "1" ? true : false,
    unit8Array: unit8ArrayShort,
  };
}
