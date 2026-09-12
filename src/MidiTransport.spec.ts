import { Failure } from "fail-up";
import { MidiTransport } from "./MidiTransport";
import {
  DecodedMidiTransportMessage,
  MidiTransportUnknownEvent,
} from "./types";
import { delay } from "@joue-bien/audio-transport";

describe("MidiTransport", () => {
  it("Connects and runs through okay check", async () => {
    const cleanUpController = new AbortController();

    const server = new MidiTransport({
      controlClient: {
        responsePort: 5000,
      },
      messageClient: {
        responsePort: 5001,
      },
      hardwareName: "Server",
      cleanUpController: cleanUpController,
    });

    const client = new MidiTransport({
      controlClient: {
        remotePort: 5000,
        responsePort: 5033,
      },
      messageClient: {
        remotePort: 5001,
        responsePort: 5034,
      },
      hardwareName: "Server",
      cleanUpController: cleanUpController,
    });

    server.onAnyMessage((event: MidiTransportUnknownEvent) => {
      if (event.decoded.CK) {
        console.log(
          "@@@server CK",
          event.decoded.CK,
          event.decoded.CK.timestamps,
        );
      } else {
        // console.log("@@@server", JSON.stringify(event, null, 2));
      }
    });

    client.onAnyMessage((event: MidiTransportUnknownEvent) => {
      if (event.decoded.CK) {
        console.log(
          "@@@client CK",
          event.decoded.CK,
          event.decoded.CK.timestamps,
        );
      } else {
        // console.log("@@@client", JSON.stringify(event, null, 2));
      }
    });

    server.onMessage({
      command: "IN",
      callBack: async (event) => {
        //  Auto Reply as OK
        const res = await server.respond({
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

    await server.listen();

    const floatingClientOkay = await client.connect();
    console.log("@@@client ok", floatingClientOkay);

    const floatingClockFirst = server.waitForMessage({
      command: "CK",
      exitMs: 1000,
    });

    const firstClockOnServer = await floatingClockFirst;

    console.log("@@@@floatingClockFirst", firstClockOnServer);

    await delay({
      ms: 2000,
    });

    // const floatingClockSecond = server.waitForMessage({
    //   command: "CK",
    // });

    // const finalClock = await floatingClockSecond;
    // if (finalClock instanceof Failure === false) {
    //   console.log(
    //     "@@@@floatingClockSecond",
    //     finalClock,
    //     finalClock.decoded.CK.timestamps,
    //   );
    // }

    // const askRes = (await floatingServerAsk) as DecodedMidiTransportMessage;

    // const clientOk = await floatingClientOkay;

    // console.log("@@@clientOk", askRes, clientOk);

    // server.respond({
    //   control: "OK",
    //   remotePort: askRes.
    // })

    // await floatingClockFirst;

    cleanUpController.abort();
  });
});

// function u
