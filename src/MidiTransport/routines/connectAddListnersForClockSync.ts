import { timestamp } from "@joue-bien/audio-transport";
import { type MidiTransportLike } from "./../MidiTransportLike";

/** Add listners for clock sync. (Client Only) */
export function connectAddListnersForClockSync(transport: MidiTransportLike) {
  const cleanUp = transport.onMessage({
    command: "CK",
    callBack: (event) => {
      const {
        decoded: { CK },
      } = event;
      const { count, timestamps } = CK;
      if (count === 0 && timestamps[0]) {
        transport.send({
          CK: {
            header: "CK",
            count: 1,
            ssrc: transport.ssrc,
            timestamps: [timestamp.nowRTP64Bit(), timestamps[0]],
          },
        });
      }
      if (count === 1 && timestamps[1]) {
        transport.send({
          CK: {
            header: "CK",
            count: 2,
            ssrc: transport.ssrc,
            timestamps: [timestamp.nowRTP64Bit(), timestamps[1], timestamps[0]],
          },
        });
      }
    },
  });
  return cleanUp;
}
