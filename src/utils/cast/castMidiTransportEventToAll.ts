import { DecodedMidiTransportMessage, MidiTransportEvent } from "../../types";

/** 
 * Deal with TS lack of inferance - this casts from specfic to an un-specific. 
 * Allowing us to set a specific type and return it in a function that return type is T.
 * 
 * @example
 ```ts
    function test<T extends keyof DecodedMidiTransportMessage>(
      command: T,
    ): MidiTransportEvent<T> {
      if (command === "IN") {
        const t = castMidiTransportEventToAll<T, "IN">({});
        return t;
      }
    }
 ```
*/
export function castMidiTransportEventToAll<
  T extends keyof DecodedMidiTransportMessage,
  E extends keyof DecodedMidiTransportMessage,
>(event: MidiTransportEvent<E>): MidiTransportEvent<T> {
  return event as unknown as MidiTransportEvent<T>;
}
