import { MidiTransport } from "./MidiTransport";
import { MidiTransportUnknownEvent } from "./types";
import { setUpFakeTimers } from "./utils/setUpFakeTimers";
import { listenAddListnersForAutoOK } from "./utils/listenAddListnersForAutoOK";

describe("MidiTransport", () => {
  setUpFakeTimers({
    fake: ["fake", "Date", "performance"],
  });

  it("Connects and runs through okay check and clocks", async () => {
    const serverOnSpy = vi.fn();
    const clientOnSpy = vi.fn();

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
      serverOnSpy(event);
    });

    client.onAnyMessage((event: MidiTransportUnknownEvent) => {
      clientOnSpy(event);
    });

    // Set up auto Reply as OK and start server.
    listenAddListnersForAutoOK(server);
    await server.listen();

    // Connect to client to server and finish connection handshake.
    const floatingClientOkay = await client.connect();
    expect(floatingClientOkay).toMatchObject(expect.any(AbortController));

    // Expect Server to get clock with one value
    await vi.waitFor(() => {
      expect(serverOnSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              header: "CK",
              timestamps: [expect.any(BigInt)],
            }),
          }),
        }),
      );
    });

    // Expect Client to get clock with one value
    await vi.waitFor(() => {
      expect(clientOnSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              header: "CK",
              timestamps: [expect.any(BigInt), expect.any(BigInt)],
            }),
          }),
        }),
      );
    });

    // Expect Server to get clock with three value
    await vi.waitFor(() => {
      expect(serverOnSpy).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              header: "CK",
              timestamps: [
                expect.any(BigInt),
                expect.any(BigInt),
                expect.any(BigInt),
              ],
            }),
          }),
        }),
      );
    });

    // Clean Up
    cleanUpController.abort();
  });
});
