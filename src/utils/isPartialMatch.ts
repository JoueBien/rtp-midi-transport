/** See if a sub set is with in a larger object. This is a deep equality.
 * @note: this is designed for simple objects not objects with child Objects. */
export function isPartialMatch<T extends Record<string | number, unknown>>(
  subSet: Partial<T>,
  isInObject: T,
) {
  const matchKeys: string[] = Object.keys(subSet);

  const matchingKeysArray = matchKeys.map(
    (key) => JSON.stringify(subSet[key]) === JSON.stringify(isInObject[key]),
  );
  return matchingKeysArray.includes(false) === false;
}
