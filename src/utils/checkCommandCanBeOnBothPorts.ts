import { Command } from "../types";

/** Check if a string matches an RTP MIDI Commnad. */
export function checkCommandCanBeOnBothPorts(
  str: string | Command,
): Extract<Command, "OK" | "IN" | "NO" | "BY"> | false {
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

    default:
      false;
  }
  return false;
}
