import { MidiTransportMessageRespondParams } from "../../types";

export function castMidiTransportMessageRespondParamsTo<
  E extends keyof MidiTransportMessageRespondParams,
  T extends keyof MidiTransportMessageRespondParams,
>(
  params: Pick<MidiTransportMessageRespondParams, E>,
): Pick<MidiTransportMessageRespondParams, T> {
  return params as unknown as Pick<MidiTransportMessageRespondParams, T>;
}
