import { vi } from "vitest";
import { waitForFirst } from "./waitForFirst";

describe("waitForFirst", () => {
  it("waits for first item but only resolves once", async () => {
    const spy = vi.fn();

    // Set up both Promise where we can resolve them manually.
    let resolve1 = (_: string) => {};
    const func1 = () =>
      new Promise<string>((resolve) => {
        resolve1 = resolve;
      });

    let resolve2 = (_: string) => {};
    const func2 = () =>
      new Promise<string>((resolve) => {
        resolve2 = resolve;
      });

    // Run both Promise and spy on which one is called.
    const floatingRes = waitForFirst([func1, func2]).then((res) => {
      spy(res);
      return res;
    });

    resolve1("one");
    resolve2("two");

    // Await the result.
    const res = await floatingRes;

    // Make sure it was only called once.
    expect(res).toMatchObject({ res1: "one" });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("waits for second item but only resolves once", async () => {
    const spy = vi.fn();

    // Set up both Promise where we can resolve them manually.
    let resolve1 = (_: string) => {};
    const func1 = () =>
      new Promise<string>((resolve) => {
        resolve1 = resolve;
      });

    let resolve2 = (_: string) => {};
    const func2 = () =>
      new Promise<string>((resolve) => {
        resolve2 = resolve;
      });

    // Run both Promise and spy on which one is called.
    const floatingRes = waitForFirst([func1, func2]).then((res) => {
      spy(res);
      return res;
    });

    resolve2("two");
    resolve1("one");

    // Await the result.
    const res = await floatingRes;

    // Make sure it was only called once.
    expect(res).toMatchObject({ res2: "two" });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
