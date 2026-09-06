import { AppleMIDICommand, Command } from "../types";

/** Check if a string matches an RTP MIDI Commnad. */
export function checkDecodeCommand(
  str: string | Command | "midi",
): Exclude<Command, "FB"> | "midi" | false {
  switch (str) {
    case "OK":
      return str;
    case "IN":
      return str;
    case "NO":
      return str;
    case "BY":
      return str;
    case "CK":
      return str;
    default:
      false;
  }
  return false;
}
