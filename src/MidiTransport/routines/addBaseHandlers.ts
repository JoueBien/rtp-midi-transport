import { RemoteInfo } from "dgram";
import { type MidiTransportLike } from "./../MidiTransportLike";
import { MidiTransportUnknownEvent } from "../../types";
import { MidiTransportMessage } from "./../MidiTransportMessage";
import {
  EMIT_ERROR,
  EMIT_MESSAGE_ALL,
  EMIT_MESSAGE_BY,
  EMIT_MESSAGE_CK,
  EMIT_MESSAGE_FB,
  EMIT_MESSAGE_IN,
  EMIT_MESSAGE_MIDI,
  EMIT_MESSAGE_NO,
  EMIT_MESSAGE_OK,
} from "../../constrains/message";
import { Failure } from "fail-up";
import {
  commandToLabel,
  commandToLabelOrUndefined,
} from "../../constrains/midiCommands";
import { MidiData } from "../../types/MidiData";

/** Add handlers to listen for events on both ports.
 * These listeners are suitable for both client and server.
 */
export function addBaseHandlers(transport: MidiTransportLike) {
  // Add listeners
  transport.controlClient.onMessage((msg: Buffer, rinfo: RemoteInfo) => {
    const data: MidiTransportUnknownEvent = {
      msg,
      decoded: MidiTransportMessage.decode(new Uint8Array(msg)),
      on: "control",
      rinfo,
    };

    if ("IN" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_IN, {
        ...data,
        decoded: data.decoded.IN,
      });
    }
    if ("OK" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_OK, {
        ...data,
        decoded: data.decoded.OK,
      });
    }
    if ("NO" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_NO, {
        ...data,
        decoded: data.decoded.NO,
      });
    }
    if ("BY" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_BY, {
        ...data,
        decoded: data.decoded.BY,
      });
    }

    transport.eventEmitter.emit(EMIT_MESSAGE_ALL, data);

    if ("FB" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_FB, {
        ...data,
        decoded: data.decoded.FB,
      });
    }
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

    if ("midi" in data.decoded) {
      // Emit generic midi message on bus.
      transport.eventEmitter.emit(EMIT_MESSAGE_MIDI, {
        ...data,
        decoded: data.decoded.midi,
      });
      // Emit specific midi event on bus.
      if (data.decoded.midi?.data[0] !== undefined) {
        // Dirty cast
        const commandNumber = Number(
          Object.keys(data.decoded.midi.data[0])[0],
        ) as keyof MidiData;
        const label = commandToLabelOrUndefined(commandNumber);

        // Make sure it's actually a number and has a label.
        if (isNaN(commandNumber) === false && label !== undefined) {
          transport.eventEmitter.emit(`${EMIT_MESSAGE_MIDI}_${commandNumber}`, {
            ...data,
            decoded: {
              ...data.decoded.midi,
              // Emit the first midi Event.
              data: data.decoded.midi.data[0][`${commandNumber}`],
            },
          });
        }
      }
    }

    if ("IN" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_IN, {
        ...data,
        decoded: data.decoded.IN,
      });
    }
    if ("OK" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_OK, {
        ...data,
        decoded: data.decoded.OK,
      });
    }
    if ("NO" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_NO, {
        ...data,
        decoded: data.decoded.NO,
      });
    }
    if ("BY" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_BY, {
        ...data,
        decoded: data.decoded.BY,
      });
    }

    if ("CK" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_CK, {
        ...data,
        decoded: data.decoded.CK,
      });
    }

    transport.eventEmitter.emit(EMIT_MESSAGE_ALL, data);

    if ("FB" in data.decoded) {
      transport.eventEmitter.emit(EMIT_MESSAGE_FB, {
        ...data,
        decoded: data.decoded.FB,
      });
    }
  });

  transport.messageClient.onError((err: Failure<"on-error">) => {
    transport.eventEmitter.emit(EMIT_ERROR, err);
  });
}
