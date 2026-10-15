import { MidiTransportLike } from "../MidiTransportLike";

/** When the server sends a BY message the transport is aborted.
 * Will only abort if message is sent to the control port. */
export function connectAndListenersForBy(transport: MidiTransportLike) {
  const cleanUp = transport.onMessage({
    command: "BY",
    callback(event) {
      if (event.on === "control") {
        cleanUp();
        transport.deconstructor();
      }
    },
  });
}
