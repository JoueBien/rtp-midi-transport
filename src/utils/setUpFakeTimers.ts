type FakeMethod =
  | "setTimeout"
  | "clearTimeout"
  | "setImmediate"
  | "clearImmediate"
  | "setInterval"
  | "clearInterval"
  | "Date"
  | "nextTick"
  | "hrtime"
  | "requestAnimationFrame"
  | "cancelAnimationFrame"
  | "requestIdleCallback"
  | "cancelIdleCallback"
  | "performance"
  | "queueMicrotask";

export const NOW = new Date(1789196822993);

export function setUpFakeTimers(params?: {
  now?: Date;
  fake?: ["fake", FakeMethod, ...FakeMethod[]];
}) {
  const { now, fake = ["fake", "Date"] } = params || {};

  const [_, ...toFake] = fake;

  beforeEach(() => {
    vi.useFakeTimers({
      now: now || NOW,
      toFake: toFake,
      shouldAdvanceTime: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  return {
    setSystemTime: vi.setSystemTime,
    now: vi.getMockedSystemTime() || new Date(),
  };
}
