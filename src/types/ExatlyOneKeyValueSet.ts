// export type ExatlyOneKeyValueSet<
//   Keys extends keyof Obj & string,
//   Obj extends Record<string, unknown>,
// > = { [key in Keys]: Obj[Keys] };

export type ExatlyOneKeyValue<
  K extends keyof T,
  T extends Record<string, unknown>,
> = {
  [P in K]: {
    [Q in P]: T[Q];
  } & {
    [Q in Exclude<K, P>]?: never;
  };
}[K];
