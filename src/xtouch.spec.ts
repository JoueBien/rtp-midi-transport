import { MidiTransport } from "./MidiTransport/MidiTransport";
import { delay, timestamp } from "@joue-bien/audio-transport";
import { castUnsignedInt14ToMidiData } from "./utils/cast/castUnsignedInt14ToMidiData";

describe.skip("MidiTransport", () => {
  it(
    "Connects and runs through okay check and clocks",
    {
      timeout: 60 * 1000 * 2,
    },
    async () => {
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

      // Connect to client to server and finish connection handshake.
      const floatingClientOkay = await client.connect();
      expect(floatingClientOkay).toMatchObject(expect.any(AbortController));

      // Turn all buttons on
      for (let i = 0; i < 104; i++) {
        await client.send({
          midi: {
            header: "midi",
            timestamp: timestamp.nowRTP32Bit(),
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
            timestamp: timestamp.nowRTP32Bit(),
            data: [
              {
                [14]: {
                  channel: i,
                  command: 14,
                  label: "PitchBend",
                  data: castUnsignedInt14ToMidiData(1023),
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
      //     timestamp: timestamp.nowRTP32Bit()  + 30,
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

      // Clean Up
      cleanUpController.abort();
    },
  );
});
