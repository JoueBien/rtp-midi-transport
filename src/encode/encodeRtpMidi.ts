import { unsignedIntEncoder } from "@joue-bien/audio-transport";
import { ExactlyOneKeyValuePair } from "../types/ExactlyOneKeyValuePair";
import { MidiData } from "../types/MidiData";
import { encodeMidiCommandSectionHeader } from "./encodeMidiCommandSectionHeader";
import { encodeMidiData } from "./encodeMidiData";

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
