import {
  decodeAndPopUnsignedInit,
  decodeAndPopUnsignedInit16Bit,
} from "@joue-bien/audio-transport";
import { decodeAndPopMidiCommandSectionHeader } from "./decodeAndPopMidiCommandSectionHeader";
import {
  DecodeAndPopMidiData,
  decodeAndPopMidiData,
} from "./decodeAndPopMidiData";

export type DecodedRrpMidiMessage = {
  details: {
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
    /**
     *
     * Original used midi repeate command. */
    runningStatus: boolean;
  };
  data: DecodeAndPopMidiData;
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
  const midiData = decodeAndPopMidiData(unit8Array4);

  return {
    details: {
      sequence,
      timestamp,
      ssrc,
      messageByteLength,
      journal,
      timestamps,
      runningStatus,
    },
    data: {
      ...midiData,
    },
  };
}
