import { decodeAndPopRtpHeader } from "./decoders/decodeAndPopRtpHeader";
import {
  Command,
  AppleMIDICommand,
  MidiTransportMessageParams,
  DecodedMidiTransportMessage,
} from "./types";
import { decodeAndPopRtpControl } from "./decoders/decodeAndPopRtpControl";
import { decodeAndPopRtpClock } from "./decoders/decodeAndPopRtpClock";
import { encodeRtpHeader } from "./encode/encodeRtpHeader";
import { encodRtpControl } from "./encode/encodRtpControl";
import { encodeRtpClock } from "./encode/encodeRtpClock";

const CONTROL_ONLY_COMMAND: (Command | AppleMIDICommand)[] = [
  "OK",
  "IN",
  "BY",
  "NO",
];

export const MidiTransportMessage = {
  encode: function encode(params: MidiTransportMessageParams) {
    // Encode Midi TODO:

    if ("clock" in params) {
      const { clock } = params;
      return new Uint8Array([
        ...encodeRtpHeader({ command: clock.header }),
        ...encodeRtpClock(params.clock),
      ]);
    }

    if ("control" in params) {
      const { control } = params;
      return new Uint8Array([
        ...encodeRtpHeader({ command: control.header }),
        ...encodRtpControl(params.control),
      ]);
    }

    // Return fallback to exaust types.
    return new Uint8Array(0);
  },

  decode: function decode(
    messageBuffer: Uint8Array<ArrayBuffer>,
  ): DecodedMidiTransportMessage {
    // Decode RTP header at start of message
    const { command, unit8Array: unit8Array1 } =
      decodeAndPopRtpHeader(messageBuffer);

    // Decode Midi TODO:

    // Decode Clock
    if (command === "CK") {
      const clock = decodeAndPopRtpClock(unit8Array1);
      return {
        clock: {
          header: "CK",
          ...clock,
        },
      };
    }

    // Decode Commands
    if (CONTROL_ONLY_COMMAND.includes(command)) {
      const about = decodeAndPopRtpControl(unit8Array1);
      return {
        control: {
          header: command as "IN" | "OK" | "NO" | "BY",
          ...about,
        },
      };
    }

    // On We got a bad header return a fallback message.
    return {
      fallback: {
        header: "FB",
        uint8Array: messageBuffer,
      },
    };
  },
};
