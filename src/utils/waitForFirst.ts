import { ExactlyOneKeyValuePair } from "../types/ExactlyOneKeyValuePair";

/** Run two Promise and return the first one.
 * The second promise never resolves.
 *
 * @note in testing this can leave handles open if both don't resolve.
 * Make sure you close all your handles before your test case ends.
 */
export async function waitForFirst<R1, R2>(
  args: [f1: () => Promise<R1>, f2: () => Promise<R2>],
): Promise<
  ExactlyOneKeyValuePair<{
    res1: R1;
    res2: R2;
  }>
> {
  const [p1, p2] = args;

  const resolved = new AbortController();

  return new Promise<
    ExactlyOneKeyValuePair<{
      res1: R1;
      res2: R2;
    }>
  >((resolve) => {
    p1().then((res) => {
      resolved.abort("p1");

      if (resolved.signal.reason === "p1") {
        resolve({ res1: res });
      }
    });
    p2().then((res) => {
      resolved.abort("p2");

      if (resolved.signal.reason === "p2") {
        resolve({ res2: res });
      }
    });
  });
}
