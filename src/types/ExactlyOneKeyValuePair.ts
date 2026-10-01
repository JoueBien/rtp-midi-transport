/** Allow only one key vaule pair from an object.
 * @example
 * ```ts
 * type Single = ExactlyOneKeyValuePair<{a: 1, b:2}>
 * // Passes
 * const single = { a: 1 };
 * // Fails
 * const single = { a: 1, b: 2 };
 * ```
 */
export type ExactlyOneKeyValuePair<T extends object> = {
  [K in keyof T]: { [P in K]: T[P] } & { [P in Exclude<keyof T, K>]?: never };
}[keyof T];
