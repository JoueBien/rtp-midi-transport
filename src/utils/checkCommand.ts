import { Command } from "../types";

/** Check if a string matches an RTP MIDI Commnad. */
export function checkCommand(str: string | Command): Command {
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
      "FB";
  }
  return "FB";
}
