import { MidiTransport } from "../MidiTransport";

/**
 * For testing set up the server to auto reply as OK when it recieves a IN message.
 *
 * @example ```ts
 *
 * // Listen for connections on server
 * listenAddListnersForAutoOK(server);
 * await server.listen();
 *
 * // Then connect with client
 * await client.connect();
 * ```
 *
 */
export function listenAddListnersForAutoOK(server: MidiTransport) {
  server.onMessage({
    command: "IN",
    callBack: async (event) => {
      const _res = await server.respond({
        msg: {
          OK: {
            on: event.on,
            header: "OK",
            version: 2,
            token: event.decoded.IN.token,
            ssrc: server.ssrc,
            name: server.hardwareName,
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
