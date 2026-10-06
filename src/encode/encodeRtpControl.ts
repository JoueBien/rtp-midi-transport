import { unsignedIntEncoder, stringEncoder } from "@joue-bien/audio-transport";

export function encodeRtpControl(params: {
  version: number;
  token: number;
  ssrc: number;
  name: string;
}) {
  const { version, token, ssrc, name } = params;

  return new Uint8Array([
    ...unsignedIntEncoder.encode(version),
    ...unsignedIntEncoder.encode(token),
    ...unsignedIntEncoder.encode(ssrc),
    ...stringEncoder.encodeTerminated(name),
  ]);
}
