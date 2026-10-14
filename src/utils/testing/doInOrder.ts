/** Do two async actions in order one after each other.
 * Doesn't matter which order they are defined.
 * Allows visual order to be right even if execution order is not.
 * useful if you need to define a listener and send an action. */
export async function doInOrder<R1, R2>(args: {
  first: () => Promise<R1>;
  second: () => Promise<R2>;
}): Promise<[R1, R2]> {
  const { first, second } = args;
  const r1 = await first();
  const r2 = await second();

  return [r1, r2];
}
