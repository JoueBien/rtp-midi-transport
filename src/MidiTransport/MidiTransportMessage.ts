import { decodeAndPopRtpHeader } from "./../decoders/decodeAndPopRtpHeader.ts";
import {
  type Command,
  type AppleMIDICommand,
  type MidiTransportMessageParams,
  type DecodedMidiTransportMessage,
} from "./../types/index.ts";
import { decodeAndPopRtpControl } from "./../decoders/decodeAndPopRtpControl.ts";
import { decodeAndPopRtpClock } from "./../decoders/decodeAndPopRtpClock.ts";
import { encodeRtpHeader } from "./../encode/encodeRtpHeader.ts";
import { encodeRtpClock } from "./../encode/encodeRtpClock.ts";
import { castMidiTransportMessageParamsTo } from "./../utils/cast/castMidiTransportMessageParamsTo.ts";
import { decodeAndPopRtpMidi } from "./../decoders/decodeAndPopRtpMidi.ts";
import { encodeRtpMidi } from "./../encode/encodeRtpMidi.ts";
import { encodeRtpControl } from "../encode/encodeRtpControl.ts";

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
    // Encode midi data.
    if ("midi" in params) {
      const command = castMidiTransportMessageParamsTo<T, "midi">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "midi" }),
        ...encodeRtpMidi(command.midi),
      ]);
    }

    // Encode Clock.
    if ("CK" in params) {
      const command = castMidiTransportMessageParamsTo<T, "CK">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "CK" }),
        ...encodeRtpClock(command.CK),
      ]);
    }

    // Encode Commands.
    if ("IN" in params) {
      const command = castMidiTransportMessageParamsTo<T, "IN">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "IN" }),
        ...encodeRtpControl(command.IN),
      ]);
    }

    if ("OK" in params) {
      const command = castMidiTransportMessageParamsTo<T, "OK">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "OK" }),
        ...encodeRtpControl(command.OK),
      ]);
    }

    if ("NO" in params) {
      const command = castMidiTransportMessageParamsTo<T, "NO">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "NO" }),
        ...encodeRtpControl(command.NO),
      ]);
    }

    if ("BY" in params) {
      const command = castMidiTransportMessageParamsTo<T, "BY">(params);
      return new Uint8Array([
        ...encodeRtpHeader({ command: "BY" }),
        ...encodeRtpControl(command.BY),
      ]);
    }

    // Return fallback to exhaust types.
    return new Uint8Array(0);
  },

  decode: function decode(
    messageBuffer: Uint8Array<ArrayBuffer>,
  ): Partial<DecodedMidiTransportMessage> {
    // Decode RTP header at start of message.
    const { command, unit8Array: unit8Array1 } =
      decodeAndPopRtpHeader(messageBuffer);

    // Decode Midi.
    if (command === "midi") {
      const midi = decodeAndPopRtpMidi(unit8Array1);
      return {
        midi: {
          header: "midi",
          ...midi,
        },
      };
    }

    // Decode Clock.
    if (command === "CK") {
      const clock = decodeAndPopRtpClock(unit8Array1);
      return {
        CK: {
          header: "CK",
          ...clock,
        },
      };
    }

    // Decode Commands.
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
    return {
      FB: {
        header: "FB",
        uint8Array: messageBuffer,
      },
    };
  },
};
