import { OscMessage } from "./OscMessage";

describe("OscMessage", () => {
  it("encodes and decodes", () => {
    const input = OscMessage.encode("/mix/on", [
      { i: 1234 },
      { f: 1234.1234 },
      { s: "str" },
      { T: true },
      { F: false },
      { N: null },
      { I: Infinity },
    ]);

    const res = OscMessage.decode(input);

    expect(res.address).toBe("/mix/on");
    expect(res.argTypes).toMatchObject(["i", "f", "s", "T", "F", "N", "I"]);
    expect(res.args[0]).toMatchObject({ i: 1234 });
    expect(res.args[1]).toMatchObject({ f: 1234.1234130859375 });
    expect(res.args[2]).toMatchObject({ s: "str" });
    expect(res.args[3]).toMatchObject({ T: true });
    expect(res.args[4]).toMatchObject({ F: false });
    expect(res.args[5]).toMatchObject({ N: null });
    expect(res.args[6]).toMatchObject({ I: Infinity });
  });
});
