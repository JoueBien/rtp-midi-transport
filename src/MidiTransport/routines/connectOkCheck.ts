import { Failure } from "fail-up";
import { type MidiTransportLike } from "./../MidiTransportLike";

const EXIT_TIME_MS = 500;

/** Run through the IN/OK cycle on both ports.
 * Will reutrn error if server takes longer than 500ms to respond.
 */
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
        },
      },
      listen: {
        exitMs: EXIT_TIME_MS,
        command: "OK",
      },
    }),
  ]);

  // Reject on sucess if token was bad.
  if (
    controlOkay instanceof Failure === false &&
    controlOkay.decoded.OK.token !== transport.token
  ) {
    return new Failure<"connection-no">({
      type: "connection-no",
      message: `Server responded with bad token on control port. Client sent "${transport.token}". Server Responded: "${controlOkay.decoded.OK.token}".`,
    });
  }

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
          },
        },
        listen: {
          command: "OK",
        },
      }),
    ]);

    // Reject on sucess if token was bad.
    if (
      messageOkay instanceof Failure === false &&
      messageOkay.decoded.OK.token !== transport.token
    ) {
      return new Failure<"connection-no">({
        type: "connection-no",
        message: `Server responded with bad token on message port. Client sent "${transport.token}". Server Responded: "${messageOkay.decoded.OK.token}".`,
      });
    }

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
