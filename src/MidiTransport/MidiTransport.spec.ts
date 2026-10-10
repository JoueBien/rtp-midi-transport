import { vi } from "vitest";
import { sendAndWaitFor } from "../utils/testing/doInOrder";
import { setUpClient } from "../utils/testing/setUpClient";
import { setUpFakeTimers } from "../utils/testing/setUpFakeTimers";
import { setUpServer } from "../utils/testing/setUpServer";

describe("MidiTransport", () => {
  const { advanceTimersByTimeAsync } = setUpFakeTimers({
    fake: [
      "fake",
      "Date",
      "performance",
      // We are avoiding mocking the setTimeout so we don't have to advance the time all the time.
      // "setTimeout", "clearTimeout",
      "setInterval",
      "clearInterval",
    ],
  });

  const { getCurrentClient, clientStartUpOnSpy } = setUpClient();

  const { getCurrentServer, serverOnSpy, serverCleanUp } = setUpServer();

  it("Connects and runs through okay check and clocks", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server
    await server.listen();

    // // Connect to client to server and finish connection handshake.
    const floatingClientOkay = await client.connect();
    expect(floatingClientOkay).toMatchObject(expect.any(AbortController));

    // Expect Server to get clock with one value
    await vi.waitFor(() => {
      expect(serverOnSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              header: "CK",
              ssrc: client.ssrc,
              count: 0,
              timestamps: [expect.any(BigInt)],
            }),
          }),
        }),
      );
    });

    // Expect Client to get clock with one value
    await vi.waitFor(() => {
      expect(clientStartUpOnSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              ssrc: server.ssrc,
              count: 1,
              header: "CK",
              timestamps: [expect.any(BigInt), expect.any(BigInt)],
            }),
          }),
        }),
      );
    });

    // Expect Server to get clock with three value
    await vi.waitFor(() => {
      expect(serverOnSpy).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              header: "CK",
              ssrc: client.ssrc,
              count: 2,
              timestamps: [
                expect.any(BigInt),
                expect.any(BigInt),
                expect.any(BigInt),
              ],
            }),
          }),
        }),
      );
    });

    // Expect that the clock pulse was sent.
    await advanceTimersByTimeAsync(1 * 1000);
    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();
    await advanceTimersByTimeAsync(40 * 1000);
    await vi.runOnlyPendingTimersAsync();

    await vi.waitFor(() => {
      expect(serverOnSpy).toHaveBeenNthCalledWith(
        7,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              header: "CK",
              timestamps: [expect.any(BigInt)],
              ssrc: client.ssrc,
              count: 0,
            }),
          }),
        }),
      );
    });
    await vi.waitFor(() => {
      expect(serverOnSpy).toHaveBeenNthCalledWith(
        8,
        expect.objectContaining({
          decoded: expect.objectContaining({
            CK: expect.objectContaining({
              header: "CK",
              ssrc: client.ssrc,
              count: 2,
              timestamps: [
                expect.any(BigInt),
                expect.any(BigInt),
                expect.any(BigInt),
              ],
            }),
          }),
        }),
      );
    });
  });

  it("It Decodes BY", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server & Client. Make sure to remove auto Okay.
    await server.listen();
    await client.connect();

    const [resControl] = await sendAndWaitFor({
      send: () =>
        client.send({
          BY: {
            on: "control",
            header: "BY",
          },
        }),
      waitFor: () =>
        server.waitForMessage({
          command: "BY",
        }),
    });

    const [resMessage] = await sendAndWaitFor({
      send: () =>
        client.send({
          BY: {
            on: "message",
            header: "BY",
          },
        }),
      waitFor: () =>
        server.waitForMessage({
          command: "BY",
        }),
    });

    expect(resControl).toMatchObject({
      msg: expect.any(Buffer),
      decoded: {
        header: "BY",
        version: 2,
        token: expect.any(Number),
        ssrc: client.ssrc,
        name: "Client",
        unit8Array: expect.any(Uint8Array),
      },
      on: "control",
      rinfo: {
        address: expect.any(String),
        family: "IPv4",
        port: 5033,
        size: 23,
      },
    });

    expect(resMessage).toMatchObject({
      msg: expect.any(Buffer),
      decoded: {
        header: "BY",
        version: 2,
        token: expect.any(Number),
        ssrc: client.ssrc,
        name: "Client",
        unit8Array: expect.any(Uint8Array),
      },
      on: "message",
      rinfo: {
        address: expect.any(String),
        family: "IPv4",
        port: 5034,
        size: 23,
      },
    });
  });

  it("Dies on control NO", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server & Client. Make sure to remove auto Okay.
    await server.listen();
    serverCleanUp.listenAddListenersForAutoOkCleanUp();

    server.onOnceMessage({
      command: "IN",
      callBack: async (event) => {
        return await server.respond({
          msg: {
            NO: {
              on: event.on,
              header: "NO",
              token: event.decoded.token,
            },
          },
          to: {
            remoteAddress: event.rinfo.address,
            remotePort: event.rinfo.port,
          },
        });
      },
    });

    const res = await client.connect();
    expect(res).toMatchObject(
      expect.objectContaining({
        message:
          "Server control port replied with no or did not respond. Failed at Stage: control check - responded with NO.",
        type: "connection-no",
      }),
    );
  });

  it("Dies on message NO", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server & Client. Make sure to remove auto Okay.
    await server.listen();
    serverCleanUp.listenAddListenersForAutoOkCleanUp();

    server.onMessage({
      command: "IN",
      callBack: async (event) => {
        if (event.on === "control") {
          return await server.respond({
            msg: {
              OK: {
                on: "control",
                header: "OK",
                token: event.decoded.token,
              },
            },
            to: {
              remoteAddress: event.rinfo.address,
              remotePort: event.rinfo.port,
            },
          });
        } else {
          return await server.respond({
            msg: {
              NO: {
                on: "message",
                header: "NO",
                token: event.decoded.token,
              },
            },
            to: {
              remoteAddress: event.rinfo.address,
              remotePort: event.rinfo.port,
            },
          });
        }
      },
    });

    const res = await client.connect();
    expect(res).toMatchObject(
      expect.objectContaining({
        message:
          "Server message port replied with no or did not respond. Failed at Stage: message check - responded with NO.",
        type: "connection-no",
      }),
    );
  });

  it("Dies on abort", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server & Client
    await server.listen();
    await client.connect();

    server.deconstructor();
    client.deconstructor();

    expect(await server.isListeningOk()).toMatchObject(
      expect.objectContaining({
        type: "aborted",
      }),
    );

    expect(await client.isListeningOk()).toMatchObject(
      expect.objectContaining({
        type: "aborted",
      }),
    );
  });

  it("Sends and decodes on client and server", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server & Client
    await server.listen();
    await client.connect();

    const [res1, sendRes1] = await sendAndWaitFor({
      send: () =>
        client.send({
          midi: {
            header: "midi",
            data: [
              {
                250: {
                  label: "Start",
                  command: 250,
                },
              },
            ],
            timestamp: 1,
          },
        }),
      waitFor: () =>
        server.waitForMidiMessage({
          command: 250,
        }),
    });

    const [res2, sendRes2] = await sendAndWaitFor({
      send: () =>
        server.respond({
          to: {
            remotePort: 5034,
            remoteAddress: "127.0.0.1",
          },
          msg: {
            midi: {
              header: "midi",
              data: [
                {
                  250: {
                    label: "Start",
                    command: 250,
                  },
                },
              ],
              timestamp: 2,
            },
          },
        }),
      waitFor: () =>
        client.waitForMidiMessage({
          command: 250,
        }),
    });

    // Clint sent to server
    expect(sendRes1).toBe("ok");
    expect(res1).toMatchObject({
      msg: expect.any(Buffer),
      decoded: {
        header: "midi",
        sequence: expect.any(Number),
        timestamp: 1,
        ssrc: client.ssrc,
        messageByteLength: 1,
        journal: false,
        timestamps: false,
        runningStatus: false,
        data: {
          command: 250,
          label: "Start",
        },
        unit8Array: expect.any(Uint8Array),
        popped: 1,
      },
      on: "message",
      rinfo: {
        address: expect.any(String),
        family: "IPv4",
        port: 5034,
        size: 14,
      },
    });

    // Server sent to client.
    expect(sendRes2).toBe("ok");
    expect(res2).toMatchObject({
      msg: expect.any(Buffer),
      decoded: {
        header: "midi",
        sequence: expect.any(Number),
        timestamp: 2,
        ssrc: server.ssrc,
        messageByteLength: 1,
        journal: false,
        timestamps: false,
        runningStatus: false,
        data: {
          command: 250,
          label: "Start",
        },
        unit8Array: expect.any(Uint8Array),
        popped: 1,
      },
      on: "message",
      rinfo: {
        address: expect.any(String),
        family: "IPv4",
        port: 5001,
        size: 14,
      },
    });
  });

  it("Midi waitForMidiMessage can find a match", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server & Client
    await server.listen();
    await client.connect();

    const [res1, sendRes1] = await sendAndWaitFor({
      send: () =>
        client.send({
          midi: {
            header: "midi",
            data: [
              {
                8: {
                  label: "NoteOff",
                  command: 8,
                  channel: 1,
                  data: [100, 101],
                },
              },
            ],
            timestamp: 1,
          },
        }),
      waitFor: () =>
        server.waitForMidiMessage({
          command: 8,
          matches: {
            channel: 1,
            data: [100, 101],
          },
        }),
    });

    // Clint sent to server
    expect(sendRes1).toBe("ok");
    expect(res1).toMatchObject({
      msg: expect.any(Buffer),
      decoded: {
        header: "midi",
        sequence: expect.any(Number),
        timestamp: 1,
        ssrc: client.ssrc,
        messageByteLength: 3,
        journal: false,
        timestamps: false,
        runningStatus: false,
        data: {
          label: "NoteOff",
          command: 8,
          channel: 1,
          data: [100, 101],
        },
        unit8Array: expect.any(Uint8Array),
        popped: 1,
      },
      on: "message",
      rinfo: {
        address: expect.any(String),
        family: "IPv4",
        port: 5034,
        size: 16,
      },
    });
  });

  it("Midi onMidiMessage can find a match", async () => {
    const client = getCurrentClient();
    const server = getCurrentServer();

    // Start Server & Client
    await server.listen();
    await client.connect();

    const midiSpy = vi.fn();

    const [_, sendRes1] = await sendAndWaitFor({
      send: () =>
        client.send({
          midi: {
            header: "midi",
            data: [
              {
                8: {
                  label: "NoteOff",
                  command: 8,
                  channel: 1,
                  data: [100, 101],
                },
              },
            ],
            timestamp: 1,
          },
        }),
      waitFor: async () =>
        server.onMidiMessage({
          command: 8,
          matches: {
            channel: 1,
            data: [100, 101],
          },
          callBack: (event) => {
            midiSpy(event);
          },
        }),
    });

    // Clint sent to server
    expect(sendRes1).toBe("ok");

    await vi.waitFor(() => {
      expect(midiSpy).toHaveBeenCalledTimes(1);
    });

    expect(midiSpy).toHaveBeenCalledExactlyOnceWith({
      msg: expect.any(Buffer),
      decoded: {
        header: "midi",
        sequence: expect.any(Number),
        timestamp: 1,
        ssrc: client.ssrc,
        messageByteLength: 3,
        journal: false,
        timestamps: false,
        runningStatus: false,
        data: {
          label: "NoteOff",
          command: 8,
          channel: 1,
          data: [100, 101],
        },
        unit8Array: expect.any(Uint8Array),
        popped: 1,
      },
      on: "message",
      rinfo: {
        address: expect.any(String),
        family: "IPv4",
        port: 5034,
        size: 16,
      },
    });
  });
});
