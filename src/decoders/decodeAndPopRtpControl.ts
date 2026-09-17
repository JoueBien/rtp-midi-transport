import {
  decodeAndPopUnsignedInit,
  decodeAndPopTerminatedString,
} from "@joue-bien/audio-transport";

export type DecodedRrpControlMessage = {
  version: number;
  token: number;
  ssrc: number;
  name: string;
  unit8Array: Uint8Array<ArrayBuffer>;
};

/** Decode and pop values for IN, OK, BY or NO */
export function decodeAndPopRtpControl(
  unit8Array: Uint8Array<ArrayBuffer>,
): DecodedRrpControlMessage {
  const { unit8Array: unit8Array1, number: version } =
    decodeAndPopUnsignedInit(unit8Array);
  const { unit8Array: unit8Array2, number: token } =
    decodeAndPopUnsignedInit(unit8Array1);
  const { unit8Array: unit8Array3, number: ssrc } =
    decodeAndPopUnsignedInit(unit8Array2);
  // TODO: Make sure BY is okay here as name is optinal.
  const { str: name, unit8Array: unit8Array4 } =
    decodeAndPopTerminatedString(unit8Array3);

  return {
    version,
    token,
    ssrc,
    name,
    unit8Array: unit8Array4,
  };
}
