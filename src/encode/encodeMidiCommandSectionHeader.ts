import { intEncoder, SBitsArray } from "@joue-bien/audio-transport";

/**
 * Creates a midi list header.
   0                   1                   2                   3
   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |B|J|Z|P|LEN... |  MIDI list ...                                |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */
export function encodeMidiCommandSectionHeader(params: {
  /**
   * | J |
   * true (1) journal should be included.
   * false (0) journal should be excluded.
   * Note there is no encode or decode journal support. */
  journal: boolean;
  /** | Z |
   * true - denotes if the midi list includes 4 byte timestamps before each Midi command in the MIDI List.
   * (1-4 octets long, or 0 octets if Z = 0). */
  timestamps: boolean;
  /**
   * | P |
   * Original used midi repeate command. */
  runningStatus: boolean;
  /** | LEN |
   * Size of the midi list message in bytes. This also sets | B |
   * | B | - 0 or 1
   * "short" (0) the headers Len field is 4 bits long and the message can be up to 15 bytes.
   * "long" (1) the headers Len is a 12 bits long and the message can be up to 4095 bytes long.
   * In the short mode the header is 8 bits long.
   * In the long mode the header is 16 bits long. */
  messageByteLength: number;
}) {
  const { messageByteLength, journal, timestamps, runningStatus } = params;

  const len =
    messageByteLength > 15
      ? SBitsArray.from(intEncoder.encode(messageByteLength)).slice(32 - 12, 32)
      : SBitsArray.from(intEncoder.encode(messageByteLength)).slice(32 - 4, 32);

  const header = SBitsArray.fromSBits([
    messageByteLength > 15 ? "1" : "0",
    journal ? "1" : "0",
    timestamps ? "1" : "0",
    runningStatus ? "1" : "0",
    ...len,
  ]);
  header.alignBytes();
  return header.unit8Array;
}
