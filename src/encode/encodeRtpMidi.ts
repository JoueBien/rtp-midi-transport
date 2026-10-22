import { unsignedIntEncoder } from "@joue-bien/audio-transport";
import { type ExactlyOneKeyValuePair } from "@joue-bien/audio-transport/types";
import { type MidiData } from "../types/MidiData.ts";
import { encodeMidiCommandSectionHeader } from "./encodeMidiCommandSectionHeader.ts";
import { encodeMidiData } from "./encodeMidiData.ts";

export function encodeRtpMidi(params: {
  sequence: number;
  timestamp: number;
  ssrc: number;
  data: ExactlyOneKeyValuePair<MidiData>[];
}) {
  const { sequence, timestamp, ssrc, data } = params;
  const midiList = encodeMidiData(data);

  return new Uint8Array([
    // 16 bit sequence
    ...unsignedIntEncoder.encode16Bit(sequence),
    // 32 bit timestamp for action time
    ...unsignedIntEncoder.encode(timestamp),
    // ssrc
    ...unsignedIntEncoder.encode(ssrc),
    ...encodeMidiCommandSectionHeader({
      journal: false,
      timestamps: false,
      runningStatus: false,
      messageByteLength: midiList.length,
    }),
    ...midiList,
  ]);
}
