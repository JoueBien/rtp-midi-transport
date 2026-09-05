import {
  decodeAndPopInit,
  decodeAndPopPaddedBuffer,
  decodeAndPopFloat,
  decodeAndPopPaddedString,
  bufferEncoder,
  floatEncoder,
  intEncoder,
  stringEncoder,
} from "@joue-bien/audio-transport";
import { RemoteInfo } from "dgram";

export type Arg =
  | {
      i: number;
    }
  | {
      f: number;
    }
  | {
      s: string;
    }
  | {
      b: Uint8Array<ArrayBuffer>;
    }
  | {
      T: true;
    }
  | {
      F: false;
    }
  | {
      I: number;
    }
  | {
      N: null;
    };

export type IntArg = Extract<Arg, { i: number }>;
export type FloatArg = Extract<Arg, { f: number }>;
export type StringArg = Extract<Arg, { s: string }>;
export type TrueArg = Extract<Arg, { T: true }>;
export type FalseArg = Extract<Arg, { F: false }>;
export type InfinityArg = Extract<Arg, { I: number }>;
export type NullArg = Extract<Arg, { N: null }>;

export type DecodedOscMessage<ArgArray = Arg[]> = {
  /** The sting for the command. */
  address: string;
  /** An ordered list of the types of values stored in args. */
  argTypes: ("i" | "f" | "s" | "T" | "F" | "I" | "N" | "b")[];
  /** A list of values - order must match argTypes */
  args: ArgArray;
};

export type OscMessageEvent<ArgArray = Arg[]> = {
  msg: Buffer<ArrayBufferLike>;
  decoded: DecodedOscMessage<ArgArray>;
  rinfo: RemoteInfo;
};

export const OscMessage = {
  /**
   * Decode a 1.1 message. Arg types must be provided with in the message.
   * TODO: Will not deal with bad input!
   */
  decode: function decode(
    messageBuffer: Uint8Array<ArrayBuffer>
  ): DecodedOscMessage {
    const unit8Array = new Uint8Array(
      messageBuffer.buffer,
      messageBuffer.byteOffset,
      messageBuffer.byteLength
    );

    const { str: address, unit8Array: next1 } =
      decodeAndPopPaddedString(unit8Array);
    const { str: _messageTypes, unit8Array: next2 } =
      decodeAndPopPaddedString(next1);
    // argTypes are optional in 1.1 - not handled as per the 1.0.
    const argTypes: DecodedOscMessage["argTypes"] = _messageTypes
      .replace(",", "")
      .split("")
      .reduce((allValues, currentType) => {
        switch (currentType) {
          case "b":
            allValues.push(currentType);
            break;
          case "i":
            allValues.push(currentType);
            break;
          case "f":
            allValues.push(currentType);
            break;
          case "s":
            allValues.push(currentType);
            break;
          case "T":
            allValues.push(currentType);
            break;
          case "F":
            allValues.push(currentType);
            break;
          case "I":
            allValues.push(currentType);
            break;
          case "N":
            allValues.push(currentType);
            break;
        }

        return allValues;
      }, []);

    // Pull args out of the rest of the buffer.
    const args: Arg[] = (() => {
      let messageItemBuffer = next2;
      return argTypes
        .map((argType) => {
          switch (argType) {
            // Encoded types
            case "s": {
              const { str, unit8Array: next } =
                decodeAndPopPaddedString(messageItemBuffer);
              messageItemBuffer = next;
              const ret: Arg = { s: str };
              return ret;
            }
            case "i": {
              const { number, unit8Array: next } =
                decodeAndPopInit(messageItemBuffer);
              messageItemBuffer = next;
              const ret: Arg = { i: number };
              return ret;
            }
            case "f": {
              const { number, unit8Array: next } =
                decodeAndPopFloat(messageItemBuffer);
              messageItemBuffer = next;
              const ret: Arg = { f: number };
              return ret;
            }
            case "b": {
              const { blob, unit8Array: next } =
                decodeAndPopPaddedBuffer(messageItemBuffer);
              messageItemBuffer = next;
              const ret: Arg = { b: blob };
              return ret;
            }
            // Non-encoded types.
            case "T": {
              const ret: Arg = { T: true };
              return ret;
            }

            case "F": {
              const ret: Arg = { F: false };
              return ret;
            }

            case "N": {
              const ret: Arg = { N: null };
              return ret;
            }

            case "I": {
              const ret: Arg = { I: Infinity };
              return ret;
            }
          }
        })
        .filter((value) => value !== undefined);
    })();

    return {
      address: address,
      argTypes,
      args,
    };
  },

  /**
   * Encode a 1.1 message. Arg types must be provided with in the message.
   * TODO: Will not deal with bad input!
   */
  encode: function encode(address: string, argsArray?: Arg[]) {
    const args = argsArray || [];
    // Get the OSC type list
    const argTypes: string = args.reduce((all, current) => {
      return `${all}${Object.keys(current)[0]}`;
    }, "");

    // Encode ars into the buffer
    const argsAsBuffer: Uint8Array<ArrayBuffer>[] = (args || [])
      .map((arg) => {
        switch (true) {
          case "i" in arg:
            return intEncoder.encode(arg.i);
          case "f" in arg:
            return floatEncoder.encode(arg.f);
          case "s" in arg:
            return stringEncoder.encodePadded(arg.s);
          case "b" in arg:
            bufferEncoder.encodePadded(arg.b);
        }
        return undefined;
      })
      .filter((value) => value !== undefined);

    // Merge message, type list and args into single buffer
    const messageBuffer = Buffer.concat([
      stringEncoder.encodePadded(address),
      // argTypes are optional in 1.1 - not handled as per the 1.0.
      stringEncoder.encodePadded(`,${argTypes}`),
      ...argsAsBuffer,
    ]);

    return messageBuffer;
  },
};
