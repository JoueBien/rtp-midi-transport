/** Write a send and wait for in human readable order while running
 * code in an order where the listener is added then a message is sent. */
export async function sendAndWaitFor<W, S>(args: {
  /** The function that sends a message. */
  send: () => Promise<S>;
  /** The function that waits for a message. */
  waitFor: () => Promise<W>;
}): Promise<[W, S]> {
  const { send, waitFor } = args;

  // Start waiting for but leave it floating so we can
  const floating = waitFor();
  const resSend = await send();
  const resWaited = await floating;

  return [resWaited, resSend];
}
