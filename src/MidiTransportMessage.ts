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
import { castMidiTransportMessageParamsTo } from "./utils/cast/castMidiTransportMessageParamsTo";

const CONTROL_ONLY_COMMAND: (Command | AppleMIDICommand)[] = [
  "OK",
  "IN",
  "BY",
  "NO",
];

export const MidiTransportMessage = {
  encode: function encode<T extends keyof MidiTransportMessageParams>(
    params: Pick<MidiTransportMessageParams, T>,
  ) {
    // Encode Midi TODO:

    // params.CK
    if ("CK" in params) {
      const command = castMidiTransportMessageParamsTo<T, "CK">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "CK" }),
        ...encodeRtpClock(command.CK),
      ]);
    }

    // Commands
    if ("IN" in params) {
      const command = castMidiTransportMessageParamsTo<T, "IN">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "IN" }),
        ...encodRtpControl(command.IN),
      ]);
    }

    if ("OK" in params) {
      const command = castMidiTransportMessageParamsTo<T, "OK">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "OK" }),
        ...encodRtpControl(command.OK),
      ]);
    }

    if ("NO" in params) {
      const command = castMidiTransportMessageParamsTo<T, "NO">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "NO" }),
        ...encodRtpControl(command.NO),
      ]);
    }

    if ("BY" in params) {
      const command = castMidiTransportMessageParamsTo<T, "BY">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "BY" }),
        ...encodRtpControl(command.BY),
      ]);
    }

    // Return fallback to exaust types.
    return new Uint8Array(0);
  },

  decode: function decode(
    messageBuffer: Uint8Array<ArrayBuffer>,
  ): Partial<DecodedMidiTransportMessage> {
    // Decode RTP header at start of message
    const { command, unit8Array: unit8Array1 } =
      decodeAndPopRtpHeader(messageBuffer);
    console.log("@@@FROM<-", command, messageBuffer);

    // Decode Midi TODO:
    if (command === "midi") {
      // console.log("@@@MIDI FROM<-", unit8Array1);
    }

    // Decode Clock
    if (command === "CK") {
      const clock = decodeAndPopRtpClock(unit8Array1);
      return {
        CK: {
          header: "CK",
          ...clock,
        },
      };
    }

    // Decode Commands
    if (CONTROL_ONLY_COMMAND.includes(command)) {
      const about = decodeAndPopRtpControl(unit8Array1);

      return {
        [command]: {
          header: command,
          ...about,
        },
      };
    }

    // On We got a bad header return a fallback message.
    // (console.log("@@@ FB FROM<-", command), messageBuffer);
    return {
      FB: {
        header: "FB",
        uint8Array: messageBuffer,
      },
    };
  },
};
