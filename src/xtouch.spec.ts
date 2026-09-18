import { MidiTransport } from "./MidiTransport";
import { MidiTransportUnknownEvent } from "./types";
import { setUpFakeTimers } from "./utils/setUpFakeTimers";
import { listenAddListnersForAutoOK } from "./utils/listenAddListnersForAutoOK";
import { delay } from "@joue-bien/audio-transport";

describe("MidiTransport", () => {
  // beforeEach(() => {
  //   vi.setConfig({
  //     testTimeout: 60 * 1000,
  //   });
  // });
  // const { advanceTimersByTimeAsync, runOnlyPendingTimersAsync } =
  //   setUpFakeTimers({
  //     fake: ["fake", "Date", "performance", "setInterval", "clearInterval"],
  //   });

  it.skip(
    "Connects and runs through okay check and clocks",
    {
      timeout: 60 * 1000 * 2,
    },
    async () => {
      // const serverOnSpy = vi.fn();
      // const clientOnSpy = vi.fn();
      console.clear();

      const cleanUpController = new AbortController();

      const client = new MidiTransport({
        controlClient: {
          remoteAddress: "192.168.10.13",
          remotePort: 5004,
          responsePort: 5004,
        },
        messageClient: {
          remoteAddress: "192.168.10.13",
          remotePort: 5005,
          responsePort: 5005,
        },
        hardwareName: "CTL",
        cleanUpController: cleanUpController,
      });

      // client.onAnyMessage((event: MidiTransportUnknownEvent) => {
      //   clientOnSpy(event);
      //   // console.log(event);
      // });

      // Connect to client to server and finish connection handshake.
      const floatingClientOkay = await client.connect();
      console.log("@@@CONNECTED", floatingClientOkay);
      expect(floatingClientOkay).toMatchObject(expect.any(AbortController));

      await delay({
        ms: 50 * 1000 * 2,
      });

      client.send({
        BY: {
          on: "control",
          header: "BY",
          version: 2,
          token: client.token,
          ssrc: client.ssrc,
          name: "CTL",
        },
      });

      console.log("@@@HANG UP");

      // Clean Up
      cleanUpController.abort();
    },
  );
});
