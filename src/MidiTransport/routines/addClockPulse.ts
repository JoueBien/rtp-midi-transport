import { timestamp } from "@joue-bien/audio-transport";
import { type MidiTransportLike } from "./../MidiTransportLike";

/** Adds a recurring clock event sender to keep the connection alive.
 * The clock event must be sent at least once eveery 60 seconds.
 * To make sure we stay connected we run it every 50 seconds. */
export function addClockPulse(transport: MidiTransportLike) {
  const ptr = setInterval(async () => {
    if ((await transport.isConnectionOk()) === "ok") {
      transport.send({
        CK: {
          header: "CK",
          count: 0,
          ssrc: transport.ssrc,
          timestamps: [timestamp.nowRTP64Bit()],
        },
      });
    }
  }, 30 * 10000);

  // Clean up function.
  const cleanUpPulse = () => {
    clearInterval(ptr);
  };

  // On death of transport stop the pulse.
  transport.cleanUpController.signal.addEventListener("abort", () => {
    cleanUpPulse();
  });
  return cleanUpPulse;
}
