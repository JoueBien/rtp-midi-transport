import { intEncoder, stringEncoder } from "@joue-bien/audio-transport";

export function encodRtpControl(params: {
  version: number;
  token: number;
  ssrc: number;
  name: string;
}) {
  const { version, token, ssrc, name } = params;

  return new Uint8Array([
    ...intEncoder.encode(version),
    ...intEncoder.encode(token),
    ...intEncoder.encode(ssrc),
    ...stringEncoder.encodeTerminated(name),
  ]);
}
