import { type MidiTransportMessageRespondParams } from "../../types/index.ts";

export function castMidiTransportMessageRespondParamsTo<
  E extends keyof MidiTransportMessageRespondParams,
  T extends keyof MidiTransportMessageRespondParams,
>(
  params: Pick<MidiTransportMessageRespondParams, E>,
): Pick<MidiTransportMessageRespondParams, T> {
  return params as unknown as Pick<MidiTransportMessageRespondParams, T>;
}
