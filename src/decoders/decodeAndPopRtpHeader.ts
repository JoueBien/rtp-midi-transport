import {
  decodeAndPopBytes,
  decodeAndPopChars,
  SBitsArray,
} from "@joue-bien/audio-transport";
import { APPLE_MIDI_HEADER, RTP_HEADER_PADDING } from "./../constrains/headers";
import { AppleMIDICommand, Command } from "./../types";
import { checkCommand } from "../utils/checkCommand";

/** Using the first 4 bytes check the packet header for what it contains. */
export function decodeAndPopRtpHeader(buffer: Uint8Array<ArrayBuffer>): {
  command: Command | AppleMIDICommand;
  unit8Array: Uint8Array<ArrayBuffer>;
} {
  // Get the first 4 bytes to see what the packet is.
  const { unit8Array, bytes: first32Bits } = decodeAndPopBytes(buffer, 4);
  const bitsArray = SBitsArray.from(first32Bits);

  // Check to see if Apple MIDI header.
  if (
    APPLE_MIDI_HEADER.equals(bitsArray, {
      from: 0,
      to: 15,
    })
  ) {
    console.log("@@@MIDI?");
    return {
      command: "midi",
      unit8Array,
    };
  }

  // Check to see if RTP control or clock header.
  if (
    RTP_HEADER_PADDING.equals(bitsArray, {
      from: 0,
      to: 15,
    })
  ) {
    const dirtyCommnad = decodeAndPopChars(first32Bits, 4).str.slice(2);
    const command = checkCommand(dirtyCommnad);
    return {
      command,
      unit8Array,
    };
  }

  // Fail Throuh - we don't known what it is and we retrn Fall Back as FB.
  return {
    command: "FB",
    unit8Array,
  };
}
