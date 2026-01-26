import { UdpTransport } from "@joue-bien/audio-transport";
import { MockOscServer, mockOscServer } from "./mocks/mockOscServer";
import { OscTransport } from "./OscTransport";
import { Failure } from "fail-up";

let serverPtr: MockOscServer;

describe("OscTransport", () => {
  beforeAll(async () => {
    serverPtr = await mockOscServer();
  });

  afterAll(() => {
    serverPtr.controller.abort();
  });
  it("sends a message", async () => {
    const udpClient = new UdpTransport({
      remotePort: 9000,
      responsePort: 9001,
      remoteAddress: "localhost",
    });

    const client = new OscTransport(udpClient);
    const cleanUpController = await client.connect();
    const connectionOk = await client.isConnectionOk();

    const response = serverPtr.waitForSpecificOscMessageOnServer({
      address: "/xinfo",
    });

    const sendRes = await client.send({
      address: "/xinfo",
      args: [{ i: 1234 }],
    });

    const message = await response;

    if (cleanUpController instanceof AbortController) {
      cleanUpController.abort();
    }

    expect(connectionOk).toBe("ok");
    expect(sendRes).toBe("ok");
    expect(message).toMatchObject({
      decoded: {
        address: "/xinfo",
        argTypes: ["i"],
      },
    });
  });

  it("responds can send message to remote connections", async () => {
    const response = serverPtr.waitForSpecificOscMessageOnServer({
      address: "/message",
    });

    await serverPtr.respond({
      address: "/message",
      args: [{ i: 1234 }],
      remoteAddress: "localhost",
      remotePort: 9000,
    });

    const messageReceived = await response;

    if (messageReceived instanceof Failure) {
      throw new Error("returned Failure not message");
    }

    expect(messageReceived).toMatchObject({
      decoded: {
        address: "/message",
        argTypes: ["i"],
      },
    });
  });
});
