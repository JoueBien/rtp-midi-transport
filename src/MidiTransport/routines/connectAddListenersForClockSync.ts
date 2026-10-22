import { timestamp } from "@joue-bien/audio-transport";
import { type MidiTransportLike } from "../MidiTransportLike.ts";

/** Add listeners for clock sync. (Client Only). */
export function connectAddListenersForClockSync(transport: MidiTransportLike) {
  const cleanUp = transport.onMessage({
    command: "CK",
    callback: (event) => {
      const { decoded: CK } = event;
      const { count, timestamps } = CK;
      if (count === 0 && timestamps[0]) {
        transport.send({
          CK: {
            header: "CK",
            timestamps: [timestamp.nowRTP64Bit(), timestamps[0]],
          },
        });
      }
      if (count === 1 && timestamps[1]) {
        transport.send({
          CK: {
            header: "CK",
            timestamps: [timestamp.nowRTP64Bit(), timestamps[1], timestamps[0]],
          },
        });
      }
    },
  });
  return cleanUp;
}
