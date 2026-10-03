import { timestamp } from "@joue-bien/audio-transport";
import { type MidiTransportLike } from "./../MidiTransportLike";

/** Add listners for clock sync. (Server Only) */
export function listenAddListnersForClockSync(transport: MidiTransportLike) {
  const cleanUp = transport.onMessage({
    command: "CK",
    callBack: (event) => {
      const {
        decoded: { CK },
      } = event;
      const { count, timestamps } = CK;
      if (count === 0 && timestamps[0]) {
        transport.respond({
          msg: {
            CK: {
              header: "CK",
              // count: 1,
              // ssrc: transport.ssrc,
              timestamps: [timestamp.nowRTP64Bit(), timestamps[0]],
            },
          },
          to: {
            remotePort: event.rinfo.port,
            remoteAddress: event.rinfo.address,
          },
        });
      }
      if (count === 1 && timestamps[1]) {
        transport.respond({
          msg: {
            CK: {
              header: "CK",
              // count: 2,
              // ssrc: transport.ssrc,
              timestamps: [
                timestamp.nowRTP64Bit(),
                timestamps[1],
                timestamps[0],
              ],
            },
          },
          to: {
            remotePort: event.rinfo.port,
            remoteAddress: event.rinfo.address,
          },
        });
      }
    },
  });
  return cleanUp;
}
