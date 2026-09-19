import { decodeAndPopTerminatedBytes } from "./decodeAndPopTerminatedBytes";

describe("decodeAndPopTerminatedBytes", () => {
  it("pops a custom terminator", () => {
    const {
      bytes: res,
      unit8Array: remainder,
      popped,
    } = decodeAndPopTerminatedBytes({
      unit8Array: Uint8Array.from([1, 2, 247, 3, 4]),
      terminator: 247,
    });

    expect(popped).toBe(3);
    expect(res).toMatchObject(Uint8Array.from([1, 2]));
    expect(remainder).toMatchObject(Uint8Array.from([3, 4]));
  });

  it("handels not found", () => {
    const {
      bytes: res,
      unit8Array: remainder,
      popped,
    } = decodeAndPopTerminatedBytes({
      unit8Array: Uint8Array.from([1, 2, 247, 3, 4]),
      terminator: 0,
    });
    expect(popped).toBe(0);
    expect(res).toMatchObject(Uint8Array.from([]));
    expect(remainder).toMatchObject(Uint8Array.from([1, 2, 247, 3, 4]));
  });
});
