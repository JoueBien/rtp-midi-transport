import { SBitsArray } from "@joue-bien/audio-transport";
import {
  ChannelToSBitsArrayLookUp,
  CommandToSBitsArrayLookUp,
  MidiMessage,
} from "./MidiMessage";

const { NoteOn } = CommandToSBitsArrayLookUp;
const { 1: ch2 } = ChannelToSBitsArrayLookUp;

describe("Midi1", () => {
  it("encodes", () => {
    const res = MidiMessage.encode(
      SBitsArray.concat([NoteOn, ch2]),
      SBitsArray.from("00000111"),
      SBitsArray.from("00000110"),
      SBitsArray.from("00000110"),
    );
    console.log("@@@res", res);
  });
});
