import { MidiTransport } from "./MidiTransport/MidiTransport";
import { MidiTransportUnknownEvent } from "./types";
import { setUpFakeTimers } from "./utils/testing/setUpFakeTimers";
import { listenAddListnersForAutoOK } from "./MidiTransport/routines/listenAddListnersForAutoOK";
import { delay, timestamp } from "@joue-bien/audio-transport";
import { Failure } from "fail-up";
import { LABEL_TO_MIDI_LOOK_UP } from "./constrains/midiCommands";
import { castUnsingdInt14ToMidiData } from "./utils/cast/castUnsingdInt14ToMidiData";

describe.skip("MidiTransport", () => {
  // beforeEach(() => {
  //   vi.setConfig({
  //     testTimeout: 60 * 1000,
  //   });
  // });
  // const { advanceTimersByTimeAsync, runOnlyPendingTimersAsync } =
  //   setUpFakeTimers({
  //     fake: ["fake", "Date", "performance", "setInterval", "clearInterval"],
  //   });

  it(
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

      // Turn all buttons on
      for (let i = 0; i < 104; i++) {
        await client.send({
          midi: {
            header: "midi",
            timestamp: Number(timestamp.nowRTP64Bit() & 0xffffffffn),
            data: [
              {
                9: {
                  channel: 0,
                  command: 9,
                  label: "NoteOn",
                  data: [i, 127],
                },
              },
            ],
          },
        });
        await delay({ ms: 0.05 });
      }

      // Move Faders Half way
      for (let i = 0; i < 9; i++) {
        await client.send({
          midi: {
            header: "midi",
            timestamp: Number(timestamp.nowRTP64Bit() & 0xffffffffn),
            data: [
              {
                [14]: {
                  channel: i,
                  command: 14,
                  label: "PitchBend",
                  data: castUnsingdInt14ToMidiData(1023),
                },
              },
            ],
          },
        });
        await delay({ ms: 0.05 });
      }

      // client.send({
      //   midi: {
      //     header: "midi",
      //     timestamp: Number(timestamp.nowRTP64Bit() & 0xffffffffn) + 30,
      //     data: [
      //       {
      //         9: {
      //           channel: 0,
      //           command: 9,
      //           label: "NoteOn",
      //           data: [5, 64],
      //         },
      //       },
      //       {
      //         9: {
      //           channel: 0,
      //           command: 9,
      //           label: "NoteOn",
      //           data: [6, 64],
      //         },
      //       },
      //     ],
      //   },
      // });

      await delay({
        ms: 50 * 1000 * 2,
      });

      await client.send({
        BY: {
          on: "control",
          header: "BY",
          // version: 2,
          // token: client.token,
          // ssrc: client.ssrc,
          // name: "CTL",
        },
      });

      await client.send({
        BY: {
          on: "message",
          header: "BY",
          // version: 2,
          // token: client.token,
          // ssrc: client.ssrc,
          // name: "CTL",
        },
      });

      console.log("@@@HANG UP");

      // Clean Up
      cleanUpController.abort();
    },
  );
});
