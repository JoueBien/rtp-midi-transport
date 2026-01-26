import { UdpTransport } from "@joue-bien/audio-transport";
import { OscTransport } from "./OscTransport";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("yes 2", () => {
  test.skip("do it 2S", async () => {
    const uClient = new UdpTransport({
      responsePort: 9000,
      remotePort: 10023, // 9000,
      remoteAddress: "192.168.56.1",
    });
    const client = new OscTransport(uClient);

    try {
      await client.connect();
      client.send({
        address: "/-action/setrtasrc",
        args: [
          {
            i: 1,
          },
        ],
      });
      const res = await client.sendAndWaitForMessage({
        send: {
          address: "-stat/selidx",
          args: [],
        },
        listen: {
          address: "/-stat/selidx",
        },
      });

      console.log("@@@res", "res");
    } catch (e) {
      console.trace(e);
      client.cleanUpController.abort();
      // serverPtr.controller.abort();
    }

    client.cleanUpController.abort();
    // serverPtr.controller.abort();
  });
});
