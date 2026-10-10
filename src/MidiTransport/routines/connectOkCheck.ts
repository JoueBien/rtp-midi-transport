import { Failure } from "fail-up";
import { type MidiTransportLike } from "./../MidiTransportLike";
import { waitForFirst } from "../../utils/waitForFirst";

const EXIT_TIME_MS = 500;

/** Run through the IN/OK cycle on both ports.
 * Will return error if server takes longer than 500ms to respond.
 */
export async function connectOkCheck(transport: MidiTransportLike) {
  let connectionFailedAt = "control check";
  // Knock on control port.
  const { res1: controlOkay, res2: controlRejected } = await waitForFirst([
    () =>
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
    () =>
      transport.waitForMessage({
        command: "NO",
        exitMs: EXIT_TIME_MS,
      }),
  ]);

  if (
    controlRejected !== undefined &&
    controlRejected instanceof Failure === false
  ) {
    connectionFailedAt = "control check - responded with NO";
  }

  // Reject on success if token was bad.
  if (
    controlOkay !== undefined &&
    controlOkay instanceof Failure === false &&
    controlOkay.decoded.token !== transport.token
  ) {
    return new Failure<"connection-no">({
      type: "connection-no",
      message: `Server responded with bad token on control port. Client sent "${transport.token}". Server Responded: "${controlOkay.decoded.token}".`,
    });
  }

  // We can talk on control port.
  if (controlOkay !== undefined && controlOkay instanceof Failure === false) {
    connectionFailedAt = "message check";

    // Knock on message port.
    const { res1: messageOkay, res2: messageRejected } = await waitForFirst([
      () =>
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
      () =>
        transport.waitForMessage({
          command: "NO",
          exitMs: EXIT_TIME_MS,
        }),
    ]);

    if (
      messageRejected !== undefined &&
      messageRejected instanceof Failure === false
    ) {
      connectionFailedAt = "message check - responded with NO";
    }

    // Reject on success if token was bad.
    if (
      messageOkay !== undefined &&
      messageOkay instanceof Failure === false &&
      messageOkay.decoded.token !== transport.token
    ) {
      return new Failure<"connection-no">({
        type: "connection-no",
        message: `Server responded with bad token on message port. Client sent "${transport.token}". Server Responded: "${messageOkay.decoded.token}".`,
      });
    }

    // Return if we didn't fail.
    if (messageOkay !== undefined && messageOkay instanceof Failure === false) {
      return "ok";
    }

    // Return connection failed.
    transport.cleanUpController.abort();
    return new Failure<"connection-no">({
      type: "connection-no",
      message: `Server message port replied with no or did not respond. Failed at Stage: ${connectionFailedAt}.`,
    });
  }

  transport.cleanUpController.abort();
  return new Failure<"connection-no">({
    type: "connection-no",
    message: `Server control port replied with no or did not respond. Failed at Stage: ${connectionFailedAt}.`,
  });
}
