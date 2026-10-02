import {
  decodeAndPopUnsignedInit,
  decodeAndPopUnsignedInit16Bit,
} from "@joue-bien/audio-transport";
import { decodeAndPopMidiCommandSectionHeader } from "./decodeAndPopMidiCommandSectionHeader";
import { decodeAndPopMidiDataList } from "./decodeAndPopMidiData";
import { ExactlyOneKeyValuePair } from "../types/ExactlyOneKeyValuePair";
import { MidiData } from "../types/MidiData";

export type DecodedRrpMidiMessage = {
  /** 16 Bit seqience number of Midi Message. */
  sequence: number;
  /** 32 Bit timestamp of when the action happened. */
  timestamp: number;
  /** The RTP SSRC ID */
  ssrc: number;
  /** How many bytes there are to the midi message */
  messageByteLength: number;
  /** Is there a journal section */
  journal: boolean;
  /**
   * true - denotes if the midi list includes 4 byte timestamps before each Midi command in the MIDI List.
   * (1-4 octets long, or 0 octets if Z = 0).*/
  timestamps: boolean;
  /** Original used midi repeate command. */
  runningStatus: boolean;
  /** Midi Messages. */
  data: ExactlyOneKeyValuePair<MidiData>[];
  /** The next part of the buffer (empty or journal). */
  unit8Array: Uint8Array<ArrayBuffer>;
  /** How man bytes were poped for just the midi data. */
  popped: number;
};

export function decodeAndPopRtpMidi(
  unit8Array: Uint8Array<ArrayBuffer>,
): DecodedRrpMidiMessage {
  // Decode the remains of the RTP header.
  const { unit8Array: unit8Array1, number: sequence } =
    decodeAndPopUnsignedInit16Bit(unit8Array);
  const { unit8Array: unit8Array2, number: timestamp } =
    decodeAndPopUnsignedInit(unit8Array1);
  const { unit8Array: unit8Array3, number: ssrc } =
    decodeAndPopUnsignedInit(unit8Array2);

  // Decoded the Midi List Header.
  const {
    messageByteLength,
    journal,
    timestamps,
    runningStatus,
    unit8Array: unit8Array4,
  } = decodeAndPopMidiCommandSectionHeader(unit8Array3);

  // Decode the Midi message
  const {
    data: midiData,
    popped,
    unit8Array: unit8ArrayNext,
  } = decodeAndPopMidiDataList({
    unit8Array: unit8Array4,
    messageByteLength,
  });

  return {
    sequence,
    timestamp,
    ssrc,
    messageByteLength,
    journal,
    timestamps,
    runningStatus,
    data: midiData,
    unit8Array: unit8ArrayNext,
    popped,
  };
}
