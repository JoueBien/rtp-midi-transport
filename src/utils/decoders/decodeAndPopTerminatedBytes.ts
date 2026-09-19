export function decodeAndPopTerminatedBytes(params: {
  unit8Array: Uint8Array<ArrayBuffer>;
  /** The terminated byte. @default 0 */
  terminator: number;
}) {
  const { unit8Array, terminator } = params;
  const byteEndsAt = unit8Array.indexOf(terminator || 0);
  const byteBuffer = unit8Array.slice(0, byteEndsAt);

  const byteEndAtWithNull = byteEndsAt + 1;
  if (byteEndsAt > 0) {
    return {
      popped: byteEndAtWithNull,
      bytes: byteBuffer,
      unit8Array: unit8Array.slice(byteEndAtWithNull),
    };
  }
  /** If not found then a popped of 0 is returned. */
  return {
    popped: 0,
    bytes: Uint8Array.from([]),
    unit8Array: unit8Array,
  };
}
