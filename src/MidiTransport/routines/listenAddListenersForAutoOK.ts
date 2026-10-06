import { type MidiTransportLike } from "../MidiTransportLike";

/**
 * For testing set up the server to auto reply as OK when it receives a IN message.
 *
 * @example ```ts
 *
 * // Listen for connections on server
 * listenAddListenersForAutoOK(server);
 * await server.listen();
 *
 * // Then connect with client
 * await client.connect();
 * ```
 *
 */
export function listenAddListenersForAutoOK(server: MidiTransportLike) {
  server.onMessage({
    command: "IN",
    callBack: async (event) => {
      const _res = await server.respond({
        msg: {
          OK: {
            on: event.on,
            header: "OK",
            token: event.decoded.token,
          },
        },
        to: {
          remoteAddress: event.rinfo.address,
          remotePort: event.rinfo.port,
        },
      });
    },
  });
}
