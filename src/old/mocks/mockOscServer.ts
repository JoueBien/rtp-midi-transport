import { OscTransport } from "../OscTransport";
import {
  Arg,
  DecodedOscMessage,
  OscMessage,
  OscMessageEvent,
} from "../OscMessage";
import { UdpTransport } from "@joue-bien/audio-transport";

export type MockOscServer = Awaited<ReturnType<typeof mockOscServer>>;

export async function mockOscServer(params?: { responsePort?: number }) {
  const { responsePort } = params || {};

  const udpServer = new UdpTransport({
    responsePort: responsePort || 9000,
  });

  const oscServer = new OscTransport(udpServer);

  const controller = await oscServer.listen();

  function abort() {
    if (controller instanceof AbortController) {
      controller.abort();
    }
  }

  return {
    /**
     * A reference to the abort controllers abort function.
     * Call controller.abort(); to stop the server and to free the sockets.
     */
    controller: {
      /**
       * A reference to the abort controllers abort function.
       * Call controller.abort(); to stop the server and to free the sockets.
       */
      abort,
    },

    oscTransport: oscServer,

    /**
     * Respond with an message.
     */
    respond: async function respond(params: {
      address: string;
      args?: Arg[];
      remotePort: number;
      remoteAddress: string;
    }) {
      return oscServer.respond(params);
    },

    addMessageHandlerMock<RT>(callBack: (event: OscMessageEvent<RT>) => void) {
      return oscServer.onAnyMessage<RT>(callBack);
    },

    /**
     * What for an OSC message that matches an address.
     * Will return an error if does not get a message within 500 milliseconds.
     */
    waitForSpecificOscMessageOnServer: async <RT>(params: {
      address: string;
      /** Set a custom wait time for a message in milliseconds.
       * @default 500
       */
      exitMs?: number;
    }) => {
      const { address, exitMs } = params;
      return oscServer.waitForMessage<RT>({
        address,
        exitMs: exitMs,
      });
    },
  };
}
