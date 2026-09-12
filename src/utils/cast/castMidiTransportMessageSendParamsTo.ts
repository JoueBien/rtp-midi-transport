import { MidiTransportMessageSendParams } from "../../types";

export function castMidiTransportMessageSendParamsTo<
  E extends keyof MidiTransportMessageSendParams,
  T extends keyof MidiTransportMessageSendParams,
>(
  params: Pick<MidiTransportMessageSendParams, E>,
): Pick<MidiTransportMessageSendParams, T> {
  return params as unknown as Pick<MidiTransportMessageSendParams, T>;
}
