import { decodeAndPopRtpHeader } from "./decoders/decodeAndPopRtpHeader";
import {
  Command,
  AppleMIDICommand,
  MidiTransportMessageParams,
  DecodedMidiTransportMessage,
  DecodedMidiTransportMessage2,
} from "./types";
import { decodeAndPopRtpControl } from "./decoders/decodeAndPopRtpControl";
import { decodeAndPopRtpClock } from "./decoders/decodeAndPopRtpClock";
import { encodeRtpHeader } from "./encode/encodeRtpHeader";
import { encodRtpControl } from "./encode/encodRtpControl";
import { encodeRtpClock } from "./encode/encodeRtpClock";
import { ExatlyOneKeyValue } from "./types/ExatlyOneKeyValueSet";

const CONTROL_ONLY_COMMAND = ["OK", "IN", "BY", "NO"];

export const MidiTransportMessage = {
  encode: function encode(
    params: ExatlyOneKeyValue<
      keyof MidiTransportMessageParams,
      MidiTransportMessageParams
    >,
  ) {
    // Encode Midi TODO:

    // Encode Clock
    if (params.CK) {
      const { CK } = params;
      return new Uint8Array([
        ...encodeRtpHeader({ command: CK.header }),
        ...encodeRtpClock(params.CK),
      ]);
    }

    // Encode Params
    if (params.OK) {
      const { OK } = params;
      return new Uint8Array([
        ...encodeRtpHeader({ command: OK.header }),
        ...encodRtpControl(params.OK),
      ]);
    }

    if (params.IN) {
      const { IN } = params;
      return new Uint8Array([
        ...encodeRtpHeader({ command: IN.header }),
        ...encodRtpControl(params.IN),
      ]);
    }

    if (params.NO) {
      const { NO } = params;
      return new Uint8Array([
        ...encodeRtpHeader({ command: NO.header }),
        ...encodRtpControl(params.NO),
      ]);
    }

    if (params.BY) {
      const { BY } = params;
      return new Uint8Array([
        ...encodeRtpHeader({ command: BY.header }),
        ...encodRtpControl(params.BY),
      ]);
    }

    // Return fallback to exaust types.
    return new Uint8Array(0);
  },

  // ExatlyOneKeyValue<
  //     keyof MidiTransportMessageParams,
  //     MidiTransportMessageParams

  decode: function decode(
    messageBuffer: Uint8Array<ArrayBuffer>,
  ): ExatlyOneKeyValue<
    keyof DecodedMidiTransportMessage2,
    DecodedMidiTransportMessage2
  > {
    // Decode RTP header at start of message
    const { command, unit8Array: unit8Array1 } =
      decodeAndPopRtpHeader(messageBuffer);

    // Decode Midi TODO:

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
    if (command === "OK") {
      const about = decodeAndPopRtpControl(unit8Array1);
      return {
        ["OK"]: {
          header: command,
          ...about,
        },
      };
    }
    if (command === "IN") {
      const about = decodeAndPopRtpControl(unit8Array1);
      return {
        ["IN"]: {
          header: command,
          ...about,
        },
      };
    }

    if (command === "NO") {
      const about = decodeAndPopRtpControl(unit8Array1);
      return {
        ["NO"]: {
          header: command,
          ...about,
        },
      };
    }

    if (command === "BY") {
      const about = decodeAndPopRtpControl(unit8Array1);
      return {
        ["BY"]: {
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
