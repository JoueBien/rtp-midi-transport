import {
  decodeAndPopChars,
  decodeAndPopInit,
  decodeAndPopInit8Bit,
  decodeAndPopPaddedString,
  delay,
  timestamp,
  UdpTransport,
} from "@joue-bien/audio-transport";
import { MidiSessionMessage } from "./MidiSessionMessage";

describe("it", () => {
  it("does a ting", async () => {
    // // expect(true).toBe("true");
    const controlClient = new UdpTransport({
      remotePort: 5004,
      remoteAddress: "192.168.10.13",
      responsePort: 5014,
    });

    await controlClient.connect();

    const midiClient = new UdpTransport({
      remotePort: 5005,
      remoteAddress: "192.168.10.13",
      responsePort: 5015,
    });

    await midiClient.connect();

    controlClient.onOnceMessage(async (buf) => {
      const message = MidiSessionMessage.control.decode(Uint8Array.from(buf));
      console.log("@@@message C", message);
      controlClient.onOnceMessage(async (buf1) => {
        const message1 = MidiSessionMessage.control.decode(
          Uint8Array.from(buf1),
        );
        console.log("@@@message CC", message1);
      });
      await midiClient.send(
        MidiSessionMessage.control.encode({
          name: "SERVER X",
          command: "IN",
        }),
      );
    });

    midiClient.onMessage(async (buf) => {
      const message = MidiSessionMessage.control.decode(Uint8Array.from(buf));
      console.log("@@@message M", message);
    });

    await controlClient.send(
      MidiSessionMessage.control.encode({
        name: "SERVER X",
        command: "IN",
      }),
    );
    // try {
    //   await client.send(
    //     MidiSessionMessage.control.encode({
    //       name: "SERVER X",
    //       command: "IN",
    //     })
    //   );
    //   await client.send(
    //     MidiSessionMessage.control.encode({
    //       name: "SERVER X",
    //       command: "IN",
    //     })
    //   );
    // } catch (e) {
    //   console.trace(e);
    // }

    await delay({ ms: 2000 });
    controlClient.cleanUpController.abort();
    midiClient.cleanUpController.abort();

    // console.log("sent?", Uint8Array.from(connectPadding));
  });
});
