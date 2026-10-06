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

export type MidiChannelData3Byte<Label, Command> = {
  /** The MIDI channel 0-15 (1-16)
   * Is set to -i if the midi command has no channel.
   */
  channel: number;
  /** The 4 or 8 bit command represented as a 32 bit int. */
  command: Command;
  /** The human readable version of the command. */
  label: Label;
  /** The data from the command.
   * If the command only has one data byte then the second index in the array will be 0.
   * If the command has no data bytes then both indexes will be set to 0.
   * If the command is SystemExclusiveStart then data will be a Unit8Array filled with the message.
   */
  data: [number, number];
};

export type AnyMidiChannelData3Byte = MidiChannelData3Byte<
  "NoteOff" | "NoteOn" | "PolyphonicAftertouch" | "ControlChange" | "PitchBend",
  8 | 9 | 10 | 11 | 14
>;

export type MidiChannelData2Byte<Label, Command> = {
  /** The MIDI channel 0-15 (1-16)
   * Is set to -i if the midi command has no channel.
   */
  channel: number;
  /** The 4 or 8 bit command represented as a 32 bit int. */
  command: Command;
  /** The human redable version of the command. */
  label: Label;
  /** The data from the command.
   * If the command only has one data byte then the second index in the array will be 0.
   * If the command has no data bytes then both indexes will be set to 0.
   * If the command is SystemExclusiveStart then data will be a Unit8Array filled with the message.
   */
  data: [number];
};

export type AnyMidiChannelData2Byte = MidiChannelData2Byte<
  "ProgramChange" | "ChannelAftertouch",
  12 | 13
>;

export type MidiCommandData3Byte<Label, Command> = {
  /** The 4 or 8 bit command represented as a 32 bit int. */
  command: Command;
  /** The human redable version of the command. */
  label: Label;
  /** The data from the command.
   * If the command only has one data byte then the second index in the array will be 0.
   * If the command has no data bytes then both indexes will be set to 0.
   * If the command is SystemExclusiveStart then data will be a Unit8Array filled with the message.
   */
  data: [number, number];
};

export type AnyMidiCommandData3Byte = MidiCommandData3Byte<
  "SongPositionPointer",
  242
>;

export type MidiCommandData2Byte<Label, Command> = {
  /** The 4 or 8 bit command represented as a 32 bit int. */
  command: Command;
  /** The human redable version of the command. */
  label: Label;
  /** The data from the command.
   * If the command only has one data byte then the second index in the array will be 0.
   * If the command has no data bytes then both indexes will be set to 0.
   * If the command is SystemExclusiveStart then data will be a Unit8Array filled with the message.
   */
  data: [number];
};

export type AnyMidiCommandData2Byte = MidiCommandData2Byte<
  "TimeCodeQuarterFrame" | "SongSelect",
  241 | 243
>;

export type MidiCommandData1Byte<Label, Command> = {
  /** The 4 or 8 bit command represented as a 32 bit int. */
  command: Command;
  /** The human redable version of the command. */
  label: Label;
};

export type AnyMidiCommandData1Byte = MidiCommandData1Byte<
  | "TuneRequest"
  | "TimingClock"
  | "Start"
  | "Stop"
  | "Continue"
  | "ActiveSensing"
  | "SystemReset"
  | "Undefined",
  | 246
  | 248
  | 250
  | 251
  | 252
  | 254
  | 255
  | 244 /** Undefined */
  | 245 /** Undefined */
  | 249 /** Undefined */
  | 253 /** Undefined */
>;

export type MidiCommandDataSysEx = {
  /** The 4 or 8 bit command represented as a 32 bit int. */
  command: 240;
  /** The human redable version of the command. */
  label: "SystemExclusiveStart";
  /** The data from the command.
   * If the command only has one data byte then the second index in the array will be 0.
   * If the command has no data bytes then both indexes will be set to 0.
   * If the command is SystemExclusiveStart then data will be a Unit8Array filled with the message.
   */
  data: Uint8Array<ArrayBuffer>;
};

export type MidiData = {
  /** NoteOff */
  [8]: MidiChannelData3Byte<"NoteOff", 8>;
  /** NoteOn */
  [9]: MidiChannelData3Byte<"NoteOn", 9>;
  /** PolyphonicAftertouch */
  [10]: MidiChannelData3Byte<"PolyphonicAftertouch", 10>;
  /** ControlChange */
  [11]: MidiChannelData3Byte<"ControlChange", 11>;
  /** ProgramChange */
  [12]: MidiChannelData2Byte<"ProgramChange", 12>;
  /** ChannelAftertouch */
  [13]: MidiChannelData2Byte<"ChannelAftertouch", 13>;
  /** PitchBend */
  [14]: MidiChannelData3Byte<"PitchBend", 14>;
  /** TimeCodeQuarterFrame */
  [241]: MidiCommandData2Byte<"TimeCodeQuarterFrame", 241>;
  /** SongPositionPointer */
  [242]: MidiCommandData3Byte<"SongPositionPointer", 242>;
  /** SongSelect */
  [243]: MidiCommandData2Byte<"SongSelect", 243>;
  /** TuneRequest */
  [246]: MidiCommandData1Byte<"TuneRequest", 246>;
  /** TimingClock */
  [248]: MidiCommandData1Byte<"TimingClock", 248>;
  /** Start */
  [250]: MidiCommandData1Byte<"Start", 250>;
  /** Continue */
  [251]: MidiCommandData1Byte<"Continue", 251>;
  /** Stop */
  [252]: MidiCommandData1Byte<"Stop", 252>;
  /** ActiveSensing */
  [254]: MidiCommandData1Byte<"ActiveSensing", 254>;
  /** SystemReset */
  [255]: MidiCommandData1Byte<"SystemReset", 255>;
  /** SystemExclusiveStart */
  [240]: MidiCommandDataSysEx;
  // [LABEL_TO_MIDI_LOOK_UP.SystemExclusiveEnd]: any;
  /** Undefined  244 */
  244: MidiCommandData1Byte<"Undefined", 244>;
  /** Undefined  245 */
  245: MidiCommandData1Byte<"Undefined", 245>;
  /** Undefined  249 */
  249: MidiCommandData1Byte<"Undefined", 249>;
  /** Undefined  253 */
  253: MidiCommandData1Byte<"Undefined", 253>;
};
