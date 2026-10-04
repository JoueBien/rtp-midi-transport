import { setUpClient } from "../utils/testing/setUpClient";
import { setUpFakeTimers } from "../utils/testing/setUpFakeTimers";
import { setUpServer } from "../utils/testing/setUpServer";

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

  const { getCurrentClient, clientStartUpOnSpy } = setUpClient();

  const { getCurrentServer, serverOnSpy } = setUpServer();

  it("Connects and runs through okay check and clocks", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server
    await server.listen();

    // // Connect to client to server and finish connection handshake.
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
      expect(clientStartUpOnSpy).toHaveBeenNthCalledWith(
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
  });
});
