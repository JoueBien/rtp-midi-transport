import { MidiTransport } from "../../MidiTransport/MidiTransport";
import { listenAddListenersForAutoOK } from "../../MidiTransport/routines/listenAddListenersForAutoOK";

/** Set up a server for a test with everything we need to test a client.
 * Will automatically accept any client.
 * Cleans up on at end of each test cases.
 */
export function setUpServer(args?: {
  controlClient?: {
    responsePort?: number;
  };
  messageClient?: {
    responsePort?: number;
  };
  hardwareName?: string;
  cleanUpController?: AbortController;

  disableAutoOk?: boolean;
}) {
  const { disableAutoOk } = args || {};

  // State.
  const serverOnSpy = vi.fn();
  let server: MidiTransport;

  const cleanUp: {
    listenAddListenersForAutoOkCleanUp: () => void;
  } = {
    listenAddListenersForAutoOkCleanUp: () => {
      throw new Error(
        "listenAddListenersForAutoOkCleanUp was not added to server.",
      );
    },
  };

  // Set up.
  beforeEach(() => {
    serverOnSpy.mockClear();
    server = new MidiTransport({
      controlClient: {
        responsePort: args?.controlClient?.responsePort || 5000,
      },
      messageClient: {
        responsePort: args?.messageClient?.responsePort || 5001,
      },
      hardwareName: args?.hardwareName || "Server",
      cleanUpController: args?.cleanUpController,
    });

    // Assign a watcher.
    server.onAnyMessage((event) => {
      serverOnSpy(event);
    });

    // Set up auto Reply as OK and start server.
    if (disableAutoOk !== true) {
      cleanUp.listenAddListenersForAutoOkCleanUp =
        listenAddListenersForAutoOK(server);
    }
  });

  // Make sure we clean up.
  afterEach(() => {
    server.cleanUpController.abort();
  });

  // Support functions.

  function getCurrentServer() {
    return server;
  }

  return {
    /** Spy including start up handshake. */
    serverOnSpy,
    /** The clean up functions for any listen added on beforeEach */
    serverCleanUp: cleanUp,
    /** Get the current server that has been set up. */
    getCurrentServer,
  };
}
