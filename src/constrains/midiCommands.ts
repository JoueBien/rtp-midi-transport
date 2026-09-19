/** Human redable labels for MIDI command bytes. */
export type MidiLabel =
  | "NoteOff"
  | "NoteOn"
  | "PolyphonicAftertouch"
  | "ControlChange"
  | "ProgramChange"
  | "ChannelAftertouch"
  | "PitchBend"
  | "TimeCodeQuarterFrame"
  | "SongPositionPointer"
  | "SongSelect"
  | "TuneRequest"
  | "TimingClock"
  | "Start"
  | "Continue"
  | "Stop"
  | "ActiveSensing"
  | "SystemReset"
  | "SystemExclusiveStart"
  | "SystemExclusiveEnd"
  | "Undefined";

/** Look up for labels to 4 bit MIDI commands.
 * Note Undefined is not in this list.
 */
export const LABEL_TO_MIDI_LOOK_UP: Record<MidiLabel, number> = {
  NoteOff: 8,
  NoteOn: 9,
  PolyphonicAftertouch: 10,
  ControlChange: 11,
  ProgramChange: 12,
  ChannelAftertouch: 13,
  PitchBend: 14,
  TimeCodeQuarterFrame: 241,
  SongPositionPointer: 242,
  SongSelect: 243,
  TuneRequest: 246,
  TimingClock: 248,
  Start: 250,
  Continue: 251,
  Stop: 253,
  ActiveSensing: 254,
  SystemReset: 255,
  SystemExclusiveStart: 240,
  SystemExclusiveEnd: 247,

  /** Here to exaust types. DO NOT USE to look up  */
  Undefined: 253,
};

/** Look up for 4 bit MIDI commands to human readable values. */
export const MIDI_TO_LABEL_LOOK_UP: Record<number, MidiLabel> = {
  8: "NoteOff",
  9: "NoteOn",
  10: "PolyphonicAftertouch",
  11: "ControlChange",
  12: "ProgramChange",
  13: "ChannelAftertouch",
  14: "PitchBend",
  241: "TimeCodeQuarterFrame",
  242: "SongPositionPointer",
  243: "SongSelect",
  246: "TuneRequest",
  248: "TimingClock",
  250: "Start",
  251: "Continue",
  252: "Stop",
  254: "ActiveSensing",
  255: "SystemReset",
  240: "SystemExclusiveStart",
  247: "SystemExclusiveEnd",

  244: "Undefined",
  245: "Undefined",
  249: "Undefined",
  253: "Undefined",
};

/** Channel Commands that are encoded with 2 bytes. */
export const MIDI_3_BYTE_COMMANDS: number[] = [
  LABEL_TO_MIDI_LOOK_UP.NoteOff,
  LABEL_TO_MIDI_LOOK_UP.NoteOn,
  LABEL_TO_MIDI_LOOK_UP.PolyphonicAftertouch,
  LABEL_TO_MIDI_LOOK_UP.ControlChange,
  LABEL_TO_MIDI_LOOK_UP.PitchBend,
];

/** Channel Commands that are encoded with 2 bytes. */
export const MIDI_2_BYTE_COMMANDS: number[] = [
  LABEL_TO_MIDI_LOOK_UP.ProgramChange,
  LABEL_TO_MIDI_LOOK_UP.ChannelAftertouch,
];

/** Commands that are encoded with 1 bytes & no data. */
export const MIDI_1_BYTE_COMMANDS_LONG: number[] = [
  LABEL_TO_MIDI_LOOK_UP.TuneRequest,
  LABEL_TO_MIDI_LOOK_UP.TimingClock,
  LABEL_TO_MIDI_LOOK_UP.Start,
  LABEL_TO_MIDI_LOOK_UP.Stop,
  LABEL_TO_MIDI_LOOK_UP.Continue,
  LABEL_TO_MIDI_LOOK_UP.ActiveSensing,
  LABEL_TO_MIDI_LOOK_UP.SystemReset,
  244 /** Undefined */,
  245 /** Undefined */,
  249 /** Undefined */,
  253 /** Undefined */,
];

/** Commands that are encoded with 2 bytes. */
export const MIDI_2_BYTE_COMMANDS_LONG: number[] = [
  LABEL_TO_MIDI_LOOK_UP.TimeCodeQuarterFrame,
  LABEL_TO_MIDI_LOOK_UP.SongSelect,
];

/** Commands that are encoded with 3 bytes. */
export const MIDI_3_BYTE_COMMANDS_LONG: number[] = [
  LABEL_TO_MIDI_LOOK_UP.SongPositionPointer,
];

/** Look up MIDI command and get string back. */
export function commandToLabel(command: number): MidiLabel | "Undefined" {
  return MIDI_TO_LABEL_LOOK_UP[command] || "Undefined";
}

/** Look up MIDI command and get string back.
 * If your exacution path handles "Undefined" commands you must set returnUndefinedAs to a vaule.
 */
export function labelToCommand(
  command: MidiLabel,
  returnUndefinedAs?: 244 | 245 | 249 | 253,
): number {
  if (command === "Undefined" && returnUndefinedAs) {
    return returnUndefinedAs;
  }
  if (command === "Undefined") {
    console.warn(
      "@@@labelToCommand. Recieved `Undefined` command with no `returnUndefinedAs` set.\n" +
        "Number returned by function was the exauseted default 253.",
    );
  }
  return LABEL_TO_MIDI_LOOK_UP[command];
}
