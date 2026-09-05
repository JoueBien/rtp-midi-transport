import { stringEncoder } from "@joue-bien/audio-transport";
import { APPLE_MIDI_HEADER, BUFFER_PADDING } from "../constrains/headers";
import { AppleMIDICommand, Command } from "../types";

export function encodeRtpHeader(params: {
  command: Command | AppleMIDICommand;
}) {
  const { command } = params;

  if (command === "AppleMIDI") {
    return APPLE_MIDI_HEADER.unit8Array;
  } else {
    return new Uint8Array([
      ...Uint8Array.from([BUFFER_PADDING.CONTROL]),
      ...Uint8Array.from([BUFFER_PADDING.CONTROL]),
      ...stringEncoder.encodeChars(command),
    ]);
  }
}
