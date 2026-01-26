import { UdpTransport } from "@joue-bien/audio-transport";
// import { mockUdpServer } from "./mocks/mockUdpServer";
import { OscMessage } from "./OscMessage";
import { mockOscServer } from "./mocks/mockOscServer";

describe("yes", () => {
  test.skip("do it", async () => {
    const serverPtr = await mockOscServer();
    const client = new UdpTransport({
      responsePort: 1023,
      remotePort: 9000, // 9000,
      remoteAddress: "192.168.10.40",
    });
    try {
      await client.connect();
      // serverPtr.addMessageHandlerMock((msg, rinfo) => {
      //   console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      // });
      const response = serverPtr.waitForSpecificOscMessageOnServer({
        address: "/xinfo",
        exitMs: 1000,
      });

      const sent = await client.send(
        OscMessage.encode("/xinfo", [
          {
            s: "/meters/0",
          },
          {
            i: 100,
          },
        ])

        // Buffer.concat([
        //   // stringToPaddedBuffer("/xinfo"),
        //   // stringToPaddedBuffer("/ch/01/config/icon"),
        //   // stringToPaddedBuffer("/meters"),
        //   stringToPaddedBuffer("/ch/01/gate/thr"),
        //   stringToPaddedBuffer(","),
        //   // stringToPaddedBuffer("/meters/0"),
        // ])
      );

      const message = await response;
      console.log("@@@message", message);

      // console.log("@@@msg", msg);
      // const message = OscMessage.decode(Uint8Array.from(msg));
      // expect(message.address).toBe("/xinfo");
      // expect(message.args[0]).toMatchObject({ s: "/meters/0" });
      // const [firstArg, secondArg] = message.args;

      // expect("s" in firstArg && firstArg.s).toBe("/meters/0");
      // expect("i" in secondArg && secondArg.i).toBe(100);
      // // const command1 = decodeAndPopString(Uint8Array.from(msg));
      // // const command2 = decodeAndPopString(command1.unit8Array);
      // // expect(command1.str).toBe("/ch/01/gate/thr");
      // // expect(command2.str).toBe(",");
      // // await serverPtr.waitForMessageOnServer();
    } catch (e) {
      console.trace(e);
      client.cleanUpController.abort();
      // serverPtr.controller.abort();
    }

    client.cleanUpController.abort();
    serverPtr.controller.abort();
  });
});
