import { isPartialMatch } from "./isPartialMatch";

type TestObject = {
  keyOne: string;
  keyTwo: number[];
  keyThree: 3;
};

describe("isPartialMatch", () => {
  it("finds a match when subSet is empty", () => {
    const res = isPartialMatch<TestObject>(
      {},
      {
        keyOne: "1",
        keyTwo: [],
        keyThree: 3,
      },
    );

    expect(res).toBe(true);
  });

  it("finds a match", () => {
    const res = isPartialMatch<TestObject>(
      { keyOne: "1", keyTwo: [1, 2] },
      {
        keyOne: "1",
        keyTwo: [1, 2],
        keyThree: 3,
      },
    );

    expect(res).toBe(true);
  });

  it("finds returns false when match is not found", () => {
    const res = isPartialMatch<TestObject>(
      { keyOne: "44" },
      {
        keyOne: "1",
        keyTwo: [],
        keyThree: 3,
      },
    );

    expect(res).toBe(false);
  });
});
