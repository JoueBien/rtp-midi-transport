import { delay, timestamp } from "@joue-bien/audio-transport";
import { MidiSessionMessage } from "./MidiSessionMessage";

describe("MidiSessionMessage.control", () => {
  it("encodes and decodes sessions", () => {
    const buffer = MidiSessionMessage.control.encode({
      name: "Virtual Faders",
      command: "OK",
    });

    const message = MidiSessionMessage.control.decode(buffer);

    console.log("1234", message);

    expect(message).toMatchObject({
      command: "OK",
      version: 2,
      token: 124,
      ssrc: 1003,
      name: "Virtual Faders",
    });
  });

  it("encodes and decodes session timestamps", async () => {
    const ts0 = timestamp.nowRTP();
    await delay({ ms: 1 / 100 });
    const ts1 = timestamp.nowRTP();
    await delay({ ms: 1 / 100 });
    const ts2 = timestamp.nowRTP();

    const buffer0 = MidiSessionMessage.control.encodeTimestamp({
      timestamps: [ts0],
    });

    const buffer1 = MidiSessionMessage.control.encodeTimestamp({
      timestamps: [ts0, ts1],
    });

    const buffer2 = MidiSessionMessage.control.encodeTimestamp({
      timestamps: [ts0, ts1, ts2],
    });

    const message0 = MidiSessionMessage.control.decodeTimestamp(buffer0);
    const message1 = MidiSessionMessage.control.decodeTimestamp(buffer1);
    const message2 = MidiSessionMessage.control.decodeTimestamp(buffer2);

    expect(message0).toMatchObject({
      command: "CK",
      count: 0,
      timestamps: [ts0],
    });

    expect(message1).toMatchObject({
      command: "CK",
      count: 1,
      timestamps: [ts0, ts1],
    });

    expect(message2).toMatchObject({
      command: "CK",
      count: 2,
      timestamps: [ts0, ts1, ts2],
    });
    console.log({
      message0,
      message1,
      message2,
    });
  });
});
