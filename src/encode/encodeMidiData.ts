import { SBitsArray, unsignedIntEncoder } from "@joue-bien/audio-transport";
import { LABEL_TO_MIDI_LOOK_UP } from "../constrains/midiCommands";
import { ExactlyOneKeyValuePair } from "../types/ExactlyOneKeyValuePair";
import {
  AnyMidiChannelData2Byte,
  AnyMidiChannelData3Byte,
  AnyMidiCommandData2Byte,
  AnyMidiCommandData3Byte,
  MidiCommandDataSysEx,
  MidiData,
} from "../types/MidiData";

export function encodeMidiAnyChannel3Byte(input: AnyMidiChannelData3Byte) {
  const command = SBitsArray.fromSBits([
    ...SBitsArray.from(unsignedIntEncoder.encode8Bit(input.command)).slice(
      4,
      8,
    ),
    ...SBitsArray.from(unsignedIntEncoder.encode8Bit(input.channel)).slice(
      4,
      8,
    ),
  ]).unit8Array;
  return Uint8Array.from([
    ...command,
    ...unsignedIntEncoder.encode8Bit(input.data[0]),
    ...unsignedIntEncoder.encode8Bit(input.data[1]),
  ]);
}

export function encodeMidiAnyChannel2Byte(input: AnyMidiChannelData2Byte) {
  const command = SBitsArray.fromSBits([
    ...SBitsArray.from(unsignedIntEncoder.encode8Bit(input.command)).slice(
      4,
      8,
    ),
    ...SBitsArray.from(unsignedIntEncoder.encode8Bit(input.channel)).slice(
      4,
      8,
    ),
  ]).unit8Array;
  return Uint8Array.from([
    ...command,
    ...unsignedIntEncoder.encode8Bit(input.data[0]),
  ]);
}

export function encodeMidiAnyCommand3Byte(input: AnyMidiCommandData3Byte) {
  return Uint8Array.from([
    ...unsignedIntEncoder.encode8Bit(input.command),
    ...unsignedIntEncoder.encode8Bit(input.data[0]),
    ...unsignedIntEncoder.encode8Bit(input.data[1]),
  ]);
}

export function encodeMidiAnyCommand2Byte(input: AnyMidiCommandData2Byte) {
  return Uint8Array.from([
    ...unsignedIntEncoder.encode8Bit(input.command),
    ...unsignedIntEncoder.encode8Bit(input.data[0]),
  ]);
}

export function encodeMidiAnyCommandSysEx(input: MidiCommandDataSysEx) {
  return Uint8Array.from([
    ...unsignedIntEncoder.encode8Bit(
      LABEL_TO_MIDI_LOOK_UP.SystemExclusiveStart,
    ),
    ...input.data,
    ...unsignedIntEncoder.encode8Bit(LABEL_TO_MIDI_LOOK_UP.SystemExclusiveEnd),
  ]);
}

export function encodeMidiData(
  input: ExactlyOneKeyValuePair<MidiData>[],
): Uint8Array<ArrayBuffer> {
  const bufferArray = input.map((cmd) => {
    if (cmd[8] !== undefined) {
      return encodeMidiAnyChannel3Byte(cmd[8]);
    }
    if (cmd[9] !== undefined) {
      return encodeMidiAnyChannel3Byte(cmd[9]);
    }
    if (cmd[10] !== undefined) {
      return encodeMidiAnyChannel3Byte(cmd[10]);
    }
    if (cmd[11] !== undefined) {
      return encodeMidiAnyChannel3Byte(cmd[11]);
    }
    if (cmd[12] !== undefined) {
      return encodeMidiAnyChannel2Byte(cmd[12]);
    }
    if (cmd[13] !== undefined) {
      return encodeMidiAnyChannel2Byte(cmd[13]);
    }
    if (cmd[14] !== undefined) {
      return encodeMidiAnyChannel3Byte(cmd[14]);
    }

    // Long Commands
    if (cmd[241] !== undefined) {
      return encodeMidiAnyCommand2Byte(cmd[241]);
    }
    if (cmd[242] !== undefined) {
      return encodeMidiAnyCommand3Byte(cmd[242]);
    }
    if (cmd[243] !== undefined) {
      return encodeMidiAnyCommand2Byte(cmd[243]);
    }
    if (cmd[246] !== undefined) {
      return unsignedIntEncoder.encode8Bit(246);
    }
    if (cmd[248] !== undefined) {
      return unsignedIntEncoder.encode8Bit(248);
    }
    if (cmd[250] !== undefined) {
      return unsignedIntEncoder.encode8Bit(250);
    }
    if (cmd[251] !== undefined) {
      return unsignedIntEncoder.encode8Bit(251);
    }
    if (cmd[252] !== undefined) {
      return unsignedIntEncoder.encode8Bit(252);
    }
    if (cmd[254] !== undefined) {
      return unsignedIntEncoder.encode8Bit(254);
    }
    if (cmd[255] !== undefined) {
      return unsignedIntEncoder.encode8Bit(255);
    }
    if (cmd[240] !== undefined) {
      return encodeMidiAnyCommandSysEx(cmd[240]);
    }

    // Undefined
    if (cmd[244] !== undefined) {
      return unsignedIntEncoder.encode8Bit(244);
    }
    if (cmd[245] !== undefined) {
      return unsignedIntEncoder.encode8Bit(245);
    }
    if (cmd[249] !== undefined) {
      return unsignedIntEncoder.encode8Bit(249);
    }
    if (cmd[253] !== undefined) {
      return unsignedIntEncoder.encode8Bit(253);
    }

    return new Uint8Array(0);
  });

  return bufferArray.reduce((all, next) => {
    return Uint8Array.from([...all, ...next]);
  }, new Uint8Array(0));
}
