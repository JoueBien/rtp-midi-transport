import {
  decodeAndPopBytes,
  decodeAndPopUnsignedInit8Bit,
  SBitsArray,
} from "@joue-bien/audio-transport";

enum MidiCommand {
  NoteOff = 9,
  NoteOn,
}

export type DecodeAndPopMidiData = {
  channel: number;
  command: any;
  data: [number, number];
  // buffer: Uint8Array<ArrayBuffer>
};

export function decodeAndPopMidiData(
  unit8Array: Uint8Array<ArrayBuffer>,
): DecodeAndPopMidiData {
  const { bytes: commandByte, unit8Array: unit8Array1 } = decodeAndPopBytes(
    unit8Array,
    1,
  );

  // Check if Command is "System Common Messages" or "System Real-Time Messages"
  // https://midi.org/summary-of-midi-1-0-messages
  const sysCommand = decodeAndPopUnsignedInit8Bit(commandByte);

  // Check if Channel Voice Messages
  // Get command and channe type
  const commandSection = SBitsArray.from(commandByte);
  const commandBits = SBitsArray.fromSBits(commandSection.slice(0, 4));
  commandBits.alignBytes();
  const { number: command } = decodeAndPopUnsignedInit8Bit(
    commandBits.unit8Array,
  );

  const channelBits = SBitsArray.fromSBits(commandSection.slice(5, 8));
  channelBits.alignBytes();
  const { number: channel } = decodeAndPopUnsignedInit8Bit(
    channelBits.unit8Array,
  );

  return {
    command,
    channel,
    data: [0, 0],
  };
}
