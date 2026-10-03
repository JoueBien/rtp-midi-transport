import { MidiTransport } from "./MidiTransport";
import { MidiTransportUnknownEvent } from "./../types";
import { setUpFakeTimers } from "./../utils/setUpFakeTimers";
import { listenAddListnersForAutoOK } from "./routines/listenAddListnersForAutoOK";

describe("MidiTransport", () => {
  const { advanceTimersByTimeAsync } = setUpFakeTimers({
    fake: [
      "fake",
      "Date",
      "performance",
      // "setTimeout",
      // "clearTimeout",
      "setInterval",
      "clearInterval",
    ],
  });

  it(
    "Connects and runs through okay check and clocks",
    { timeout: 8 * 10000 },
    async () => {
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
                ssrc: client.ssrc,
                count: 0,
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
                ssrc: server.ssrc,
                count: 1,
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
                ssrc: client.ssrc,
                count: 2,
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

      // Expect that the clock pulse was sent.
      await advanceTimersByTimeAsync(1 * 1000);
      await vi.runOnlyPendingTimersAsync();
      await vi.runOnlyPendingTimersAsync();
      await vi.runOnlyPendingTimersAsync();
      await vi.runOnlyPendingTimersAsync();
      await advanceTimersByTimeAsync(40 * 1000);
      await vi.runOnlyPendingTimersAsync();

      await vi.waitFor(() => {
        expect(serverOnSpy).toHaveBeenNthCalledWith(
          7,
          expect.objectContaining({
            decoded: expect.objectContaining({
              CK: expect.objectContaining({
                header: "CK",
                timestamps: [expect.any(BigInt)],
                ssrc: client.ssrc,
                count: 0,
              }),
            }),
          }),
        );
      });
      await vi.waitFor(() => {
        expect(serverOnSpy).toHaveBeenNthCalledWith(
          8,
          expect.objectContaining({
            decoded: expect.objectContaining({
              CK: expect.objectContaining({
                header: "CK",
                ssrc: client.ssrc,
                count: 2,
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
    },
  );
});
