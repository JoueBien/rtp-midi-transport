import {
  LABEL_TO_MIDI_LOOK_UP,
  MIDI_TO_LABEL_LOOK_UP,
} from "../../index.constrains.ts";
import { type MidiLabel } from "../../types/MidiData.ts";

/** Look up MIDI command and get string back. */
export function commandToLabel(command: number): MidiLabel {
  return MIDI_TO_LABEL_LOOK_UP[command] || "Undefined";
}

/** Look up MIDI command and get string back. Return `undefined` if input can't be mapped to a command. */
export function commandToLabelOrUndefined(
  command: number,
): MidiLabel | undefined {
  return MIDI_TO_LABEL_LOOK_UP[command] || undefined;
}

/** Look up MIDI command and get string back.
 * If your execution path handles "Undefined" commands you must set returnUndefinedAs to a vaule.
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
      "@@@labelToCommand. Received `Undefined` command with no `returnUndefinedAs` set.\n" +
        "Number returned by function was the exauseted default 253.",
    );
  }
  return LABEL_TO_MIDI_LOOK_UP[command];
}
