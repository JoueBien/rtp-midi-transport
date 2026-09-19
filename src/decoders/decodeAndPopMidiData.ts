import {
  decodeAndPopBytes,
  decodeAndPopUnsignedInit8Bit,
  SBitsArray,
} from "@joue-bien/audio-transport";
import {
  commandToLabel,
  LABEL_TO_MIDI_LOOK_UP,
  MIDI_1_BYTE_COMMANDS_LONG,
  MIDI_2_BYTE_COMMANDS,
  MIDI_2_BYTE_COMMANDS_LONG,
  MIDI_3_BYTE_COMMANDS,
  MIDI_3_BYTE_COMMANDS_LONG,
  MidiLabel,
} from "../constrains/midiCommands";
import { decodeAndPopTerminatedBytes } from "../utils/decoders/decodeAndPopTerminatedBytes";

enum MidiCommand {
  NoteOff = 9,
  NoteOn,
}

export type DecodeAndPopMidiData = {
  /** The MIDI channel 0-15 (1-16)
   * Is set to -i if the midi command has no channel.
   */
  channel: number;
  /** The 4 or 8 bit command represented as a 32 bit int. */
  command: number;
  /** The human redable version of the command. */
  label: MidiLabel;
  /** The data from the command.
   * If the command only has one data byte then the second index in the array will be 0.
   * If the command has no data bytes then both indexes will be set to 0.
   */
  data: [number, number] | Uint8Array<ArrayBuffer>;
  /** The buffer minus the single MIDI message that was popped. */
  unit8Array: Uint8Array<ArrayBuffer>;
  /** How may bites were removed while parsing the MIDI message that was popped.
   * If 0 was returned stop decoding as something has gone wrong.
   */
  popped: number;
};

// TODO: allow for multiple MIDI messages to be popped.
export function decodeAndPopMidiData(
  unit8Array: Uint8Array<ArrayBuffer>,
): DecodeAndPopMidiData {
  const { bytes: commandByte, unit8Array: unit8Array1 } = decodeAndPopBytes(
    unit8Array,
    1,
  );

  // Check if Command is "System Common Messages" or "System Real-Time Messages"
  // https://midi.org/summary-of-midi-1-0-messages
  // Note Missing undefined or SysEx.
  const { number: sysCommand } = decodeAndPopUnsignedInit8Bit(commandByte);
  console.log("@@@sysCommand", sysCommand);
  if (sysCommand >= 240) {
    const midiDataDecoded: {
      data: [number, number] | Uint8Array<ArrayBuffer>;
      unit8Array: Uint8Array<ArrayBuffer>;
      popped: number;
    } = (() => {
      if (MIDI_1_BYTE_COMMANDS_LONG.includes(sysCommand)) {
        return {
          data: [0, 0],
          unit8Array: unit8Array1,
          popped: 1,
          dataBytes: new Uint8Array(0),
        };
      }

      if (MIDI_2_BYTE_COMMANDS_LONG.includes(sysCommand)) {
        const { unit8Array: unit8ArrayAfter, number: d1 } =
          decodeAndPopUnsignedInit8Bit(unit8Array1);

        return {
          data: [d1, 0],
          unit8Array: unit8ArrayAfter,
          popped: 2,
        };
      }

      if (MIDI_3_BYTE_COMMANDS_LONG.includes(sysCommand)) {
        const { unit8Array: unit8ArrayD1, number: d1 } =
          decodeAndPopUnsignedInit8Bit(unit8Array1);
        const { unit8Array: unit8ArrayAfter, number: d2 } =
          decodeAndPopUnsignedInit8Bit(unit8ArrayD1);

        return {
          data: [d1, d2],
          unit8Array: unit8ArrayAfter,
          popped: 3,
        };
      }

      if (sysCommand === LABEL_TO_MIDI_LOOK_UP.SystemExclusiveStart) {
        const {
          unit8Array: unit8ArrayAfter,
          popped,
          bytes,
        } = decodeAndPopTerminatedBytes({
          unit8Array: unit8Array1,
          terminator: LABEL_TO_MIDI_LOOK_UP.SystemExclusiveEnd,
        });

        return {
          data: bytes,
          unit8Array: unit8ArrayAfter,
          // Return fail if we had an issue deociding.
          popped: popped !== 0 ? popped + 1 : 0,
        };
      }

      return {
        data: [0, 0],
        unit8Array: unit8Array1,
        popped: 0,
      };
    })();

    return {
      channel: -1,
      command: sysCommand,
      label: commandToLabel(sysCommand),
      ...midiDataDecoded,
    };
  }

  // Check if Channel Messages
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

  // Decode 2 or 3 bytes of midi data.
  const midiDataDecoded: {
    data: [number, number];
    unit8Array: Uint8Array<ArrayBuffer>;
    popped: number;
  } = (() => {
    // Handle 2 data bytes.
    if (MIDI_3_BYTE_COMMANDS) {
      const { unit8Array: unit8ArrayD1, number: d1 } =
        decodeAndPopUnsignedInit8Bit(unit8Array1);
      const { unit8Array: unit8ArrayAfter, number: d2 } =
        decodeAndPopUnsignedInit8Bit(unit8ArrayD1);
      return {
        data: [d1, d2],
        unit8Array: unit8ArrayAfter,
        popped: 3,
      };
    }
    // Handle 1 data bytes.
    if (MIDI_2_BYTE_COMMANDS) {
      const { unit8Array: unit8ArrayAfter, number: d1 } =
        decodeAndPopUnsignedInit8Bit(unit8Array1);

      return {
        data: [d1, 0],
        unit8Array: unit8ArrayAfter,
        popped: 2,
      };
    }
    return {
      channel: -1,
      data: [0, 0],
      unit8Array: unit8Array1,
      popped: 0,
    };
  })();

  return {
    command,
    channel,
    label: commandToLabel(command),
    ...midiDataDecoded,
  };
}
