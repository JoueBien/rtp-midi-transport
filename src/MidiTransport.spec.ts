import { MidiTransport } from "./MidiTransport";
import { DecodedMidiTransportMessage } from "./types";

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
        responsePort: 5003,
      },
      messageClient: {
        remotePort: 5001,
        responsePort: 5004,
      },
      hardwareName: "Server",
      cleanUpController: cleanUpController,
    });

    await server.listen();

    server.onAnyMessage((event: DecodedMidiTransportMessage) => {
      console.log("@@@event", event);
    });

    const floatingServerAsk = server.onMessage({
      command: "IN",
      callBack: (event) => {
        if (event.decoded.IN) {
          server.respond;
        }
      },
    });

    const floatingClockFirst = server.waitForMessage({
      command: "CK",
    });

    const floatingClientOkay = client.connect();

    const serverAsk = await floatingServerAsk;

    console.log("@@@serverAsk", serverAsk);

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
