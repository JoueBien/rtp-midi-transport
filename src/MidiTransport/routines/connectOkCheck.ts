import { Failure } from "fail-up";
import { type MidiTransportLike } from "./../MidiTransportLike";

const EXIT_TIME_MS = 500;

/** Run through the IN/OK cycle on both ports. */
export async function connectOkCheck(transport: MidiTransportLike) {
  let connectionFailedAt = "control check";
  // Knock on control port
  const [controlRejected, controlOkay] = await Promise.all([
    transport.waitForMessage({
      command: "NO",
      exitMs: EXIT_TIME_MS,
    }),
    transport.sendAndWaitForMessage({
      send: {
        IN: {
          on: "control",
          header: "IN",
          // ssrc: transport.ssrc,
          // token: transport.token,
          // version: 2,
          // name: transport.hardwareName,
        },
      },
      listen: {
        exitMs: EXIT_TIME_MS,
        command: "OK",
        // exitMs: 6000
      },
    }),
  ]);

  // We can talk on Control port
  if (
    controlRejected instanceof Failure &&
    controlOkay instanceof Failure === false
  ) {
    connectionFailedAt = "message check";
    const [messageRejected, messageOkay] = await Promise.all([
      transport.waitForMessage({
        command: "NO",
        exitMs: EXIT_TIME_MS,
      }),
      transport.sendAndWaitForMessage({
        send: {
          IN: {
            on: "message",
            header: "IN",
            // ssrc: transport.ssrc,
            // token: transport.token,
            // version: 2,
            // name: transport.hardwareName,
          },
        },
        listen: {
          command: "OK",
        },
      }),
    ]);

    if (
      messageRejected instanceof Failure &&
      messageOkay instanceof Failure === false
    ) {
      return "ok";
    }
    transport.cleanUpController.abort();
    return new Failure<"connection-no">({
      type: "connection-no",
      message: "Server message port replyed with NO or did not respond",
    });
  }
  transport.cleanUpController.abort();
  return new Failure<"connection-no">({
    type: "connection-no",
    message: `Server control port replyed with no or did not respond. Failed at Stage: ${connectionFailedAt}.`,
  });
}
