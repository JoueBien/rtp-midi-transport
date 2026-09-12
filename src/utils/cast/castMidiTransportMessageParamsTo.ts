import { MidiTransportMessageParams } from "../../types";

export function castMidiTransportMessageParamsTo<
  E extends keyof MidiTransportMessageParams,
  T extends keyof MidiTransportMessageParams,
>(
  params: Pick<MidiTransportMessageParams, E>,
): Pick<MidiTransportMessageParams, T> {
  return params as unknown as Pick<MidiTransportMessageParams, T>;
}
