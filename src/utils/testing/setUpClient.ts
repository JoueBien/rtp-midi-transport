import { MidiTransport } from "../../MidiTransport/MidiTransport";

/** Set up a client for testing.
 * Cleans up on at end of each test cases.
 */
export function setUpClient(args?: {
  controlClient?: {
    remotePort?: number;
    responsePort?: number;
  };
  messageClient?: {
    remotePort?: number;
    responsePort?: number;
  };
  hardwareName?: string;
  cleanUpController?: AbortController;
}) {
  // State.
  const clientStartUpOnSpy = vi.fn();
  const clientOnSpy = vi.fn();
  let client: MidiTransport;

  // Set up.
  beforeEach(() => {
    clientStartUpOnSpy.mockClear();
    clientOnSpy.mockClear();
    client = new MidiTransport({
      controlClient: {
        remotePort: args?.controlClient?.remotePort || 5000,
        responsePort: args?.controlClient?.responsePort || 5033,
      },
      messageClient: {
        remotePort: args?.messageClient?.remotePort || 5001,
        responsePort: args?.messageClient?.responsePort || 5034,
      },
      hardwareName: args?.hardwareName || "Client",
      cleanUpController: args?.cleanUpController,
    });

    // Assign a watcher.
    client.onAnyMessage((event) => {
      clientStartUpOnSpy(event);
    });
  });

  // Make sure we clean up.
  afterEach(() => {
    client.cleanUpController.abort();
  });

  // Support functions.
  /** Connect and wait untill we are done and ready. */
  async function connectAndWaitForClockDone() {
    const connected = await client.connect();
    expect(connected).toMatchObject(expect.any(AbortController));
    await vi.waitFor(() => {
      // console.log(
      //   "@@@clientStartUpOnSpy",
      //   JSON.stringify(clientStartUpOnSpy.mock.calls, null, 2),
      // );
      expect(clientStartUpOnSpy).toHaveBeenCalledWith(
        3,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              // ssrc: server.ssrc,
              count: 1,
              header: "CK",
              timestamps: [expect.any(BigInt), expect.any(BigInt)],
            }),
          }),
        }),
      );
    });

    // Assign a watcher.
    client.onAnyMessage((event) => {
      clientOnSpy(event);
    });

    // Return connected.
    return connected as AbortController;
  }

  function getCurrentClient() {
    return client;
  }

  return {
    /** Spy including start up handshake. */
    clientStartUpOnSpy,
    /** Spy for messages after start up handskae. */
    clientOnSpy,
    /** Connect and wait for clock message then return referance to client connect state. */
    connectAndWaitForClockDone,
    /** Get the current client that has been set up. */
    getCurrentClient,
  };
}
