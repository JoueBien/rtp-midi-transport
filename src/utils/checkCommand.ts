import { type Command } from "../types/index.ts";

/** Check if a string matches an RTP MIDI Command. */
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
