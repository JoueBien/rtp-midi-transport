import { RemoteInfo } from "dgram";
import { type MidiTransportLike } from "./../MidiTransportLike";
import { MidiTransportUnknownEvent } from "../../types";
import { MidiTransportMessage } from "./../MidiTransportMessage";
import { EMIT_ERROR, EMIT_MESSAGE } from "../../constrains/message";
import { Failure } from "fail-up";

/** Add handlers to listen for events on both ports.
 * These listners are sutable for both client and server.
 */
export function addBaseHandlers(transport: MidiTransportLike) {
  // Add listners
  transport.controlClient.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
    const data: MidiTransportUnknownEvent = {
      msg,
      decoded: MidiTransportMessage.decode(new Uint8Array(msg)),
      on: "control",
      rinfo,
    };
    transport.eventEmitter.emit(EMIT_MESSAGE, data);
  });

  transport.controlClient.onError((err: Failure<"on-error">) => {
    transport.eventEmitter.emit(EMIT_ERROR, err);
  });

  transport.messageClient.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
    const data: MidiTransportUnknownEvent = {
      msg,
      decoded: MidiTransportMessage.decode(new Uint8Array(msg)),
      on: "message",
      rinfo,
    };

    transport.eventEmitter.emit(EMIT_MESSAGE, data);
  });

  transport.messageClient.onError((err: Failure<"on-error">) => {
    transport.eventEmitter.emit(EMIT_ERROR, err);
  });
}
