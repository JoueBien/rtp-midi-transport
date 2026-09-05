import { SBit, SBitsArray, SByte } from "@joue-bien/audio-transport";

// Notes

export const NoteOff: "NoteOff" = "NoteOff";
export const NoteOn: "NoteOn" = "NoteOn";
export const NotePolyKeyPressure: "NotePolyKeyPressure" = "NotePolyKeyPressure";
export const NoteChannelPressure: "NoteChannelPressure" = "NoteChannelPressure";

export const ControlChange: "ControlChange" = "ControlChange";
export const ProgramChange: "ProgramChange" = "ProgramChange";
export const PitchBendChange: "PitchBendChange" = "PitchBendChange";
export const ChangeMode: "ChangeMode" = "ChangeMode";
export const SystemExclusive: "SystemExclusive" = "SystemExclusive";
export const TimeCodeQuaterFrame: "TimeCodeQuaterFrame" = "TimeCodeQuaterFrame";
export const SongPositionPointer: "SongPositionPointer" = "SongPositionPointer";
export const SongSelect: "" = "";
export const TuneRequest: "" = "";
export const TimingClock: "" = "";
export const Start: "" = "";
export const Continue: "" = "";
export const Stop: "" = "";
export const ActiveSensing: "" = "";
export const Reset: "" = "";

export type M1Command =
  | typeof NoteOff
  | typeof NoteOn
  | typeof ControlChange
  | typeof ProgramChange
  | typeof PitchBendChange
  | typeof ChangeMode
  | typeof SystemExclusive
  | typeof TimeCodeQuaterFrame
  | typeof SongPositionPointer;

export type M1Channel =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

export const CommandToSBitsArrayLookUp = {
  NoteOff: SBitsArray.fromSBits(["1", "0", "0", "0"]),
  NoteOn: SBitsArray.fromSBits(["1", "0", "0", "1"]),
  NotePolyKeyPressure: SBitsArray.fromSBits(["1", "0", "1", "0"]),
  NoteChannelPressure: SBitsArray.fromSBits(["1", "1", "1", "0"]),
  // ControlChange
  // ProgramChange
  // PitchBendChange
  // ChangeMode
  // SystemExclusive
};

export const ChannelToSBitsArrayLookUp = {
  0: SBitsArray.fromSBits(["0", "0", "0", "0"]),
  1: SBitsArray.fromSBits(["0", "0", "0", "1"]),
  2: SBitsArray.fromSBits(["0", "0", "1", "0"]),
  3: SBitsArray.fromSBits(["0", "0", "1", "1"]),
  4: SBitsArray.fromSBits(["0", "1", "0", "0"]),
  5: SBitsArray.fromSBits(["0", "1", "0", "1"]),
  6: SBitsArray.fromSBits(["0", "1", "1", "0"]),
  7: SBitsArray.fromSBits(["0", "1", "1", "1"]),
  8: SBitsArray.fromSBits(["1", "0", "0", "0"]),
  9: SBitsArray.fromSBits(["1", "0", "0", "1"]),
  10: SBitsArray.fromSBits(["1", "0", "1", "0"]),
  11: SBitsArray.fromSBits(["1", "0", "1", "1"]),
  12: SBitsArray.fromSBits(["1", "1", "0", "0"]),
  13: SBitsArray.fromSBits(["1", "1", "0", "1"]),
  14: SBitsArray.fromSBits(["1", "1", "1", "0"]),
  15: SBitsArray.fromSBits(["1", "1", "1", "1"]),
};

export const MidiMessage = {
  encode(
    status: SBitsArray,
    data1?: SBitsArray,
    data2?: SBitsArray,
    ...repeates: SBitsArray[]
  ) {
    const buffer = SBitsArray.concat([
      status.slice(0, 8),
      ...(data1 ? [data1?.slice(0, 8)] : []),
      ...(data2 ? [data2?.slice(0, 8)] : []),
      ...(repeates ? repeates.map((data) => data.slice(0, 8)) : []),
    ]);
    return buffer;
  },

  // encodeNote(
  //   state: typeof NoteOff | typeof NoteOn,
  //   channel: M1Channel,
  //   key: SByte,
  //   velocity: SByte,
  // ) {
  //   const buffer = SBitsArray.concat([
  //     CommandToSBitsArrayLookUp[state],
  //     ChannelToSBitsArrayLookUp[channel],
  //     SBitsArray.from(key),
  //     SBitsArray.from(velocity),
  //   ]).unit8Array;
  //   return buffer;
  // },

  // encodeNotePolyKeyPressure(channel: M1Channel, key: SByte, presure: SByte) {
  //   const buffer = SBitsArray.concat([
  //     CommandToSBitsArrayLookUp["NotePolyKeyPressure"],
  //     ChannelToSBitsArrayLookUp[channel],
  //     SBitsArray.from(key),
  //     SBitsArray.from(presure),
  //   ]).unit8Array;
  //   return buffer;
  // },

  // encodeNoteChannelPressure(channel: M1Channel, presure: SByte) {
  //   const buffer = SBitsArray.concat([
  //     CommandToSBitsArrayLookUp["NoteChannelPressure"],
  //     ChannelToSBitsArrayLookUp[channel],
  //     SBitsArray.from(presure),
  //   ]).unit8Array;
  //   return buffer;
  // },
  // encode(args: { command: M1Command }) {},
};
