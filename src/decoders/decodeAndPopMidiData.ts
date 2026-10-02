import {
  decodeAndPopBytes,
  decodeAndPopUnsignedInit8Bit,
  SBitsArray,
} from "@joue-bien/audio-transport";
import { LABEL_TO_MIDI_LOOK_UP } from "../constrains/midiCommands";
import { decodeAndPopTerminatedBytes } from "../utils/decoders/decodeAndPopTerminatedBytes";
import { MidiData } from "../types/MidiData";
import { ExactlyOneKeyValuePair } from "../types/ExactlyOneKeyValuePair";

/** Decode data for a two byte command. */
function popData2Byte(unit8Array: Uint8Array<ArrayBuffer>): {
  unit8Array: Uint8Array<ArrayBuffer>;
  data: [number];
} {
  const { number, unit8Array: next } = decodeAndPopUnsignedInit8Bit(unit8Array);
  return {
    data: [number],
    unit8Array: next,
  };
}

/** Decode data for a three byte command. */
function popData3Byte(unit8Array: Uint8Array<ArrayBuffer>): {
  unit8Array: Uint8Array<ArrayBuffer>;
  data: [number, number];
} {
  const { number: number1, unit8Array: unit8Array1 } =
    decodeAndPopUnsignedInit8Bit(unit8Array);
  const { number: number2, unit8Array: next } =
    decodeAndPopUnsignedInit8Bit(unit8Array1);
  return {
    data: [number1, number2],
    unit8Array: next,
  };
}

export function decodeAndPopMidiDataList(params: {
  unit8Array: Uint8Array<ArrayBuffer>;
  messageByteLength: number;
}): {
  data: ExactlyOneKeyValuePair<MidiData>[];
  unit8Array: Uint8Array<ArrayBuffer>;
  popped: number;
} {
  const { unit8Array, messageByteLength } = params;

  // Set up extraction datal
  let counter = messageByteLength; // Keep Track of how many bytes we have left.
  let depthStop = messageByteLength; // Don't enter an endless loop - stop at 1 times the byte length.
  const vaules: ExactlyOneKeyValuePair<MidiData>[] = [];
  let unit8ArrayWorking = unit8Array; // Keep updating the array.
  let encountedFailure = false;

  // Keep processing messages untill we run out of messages.
  while (depthStop > 0 && counter > 0) {
    const {
      vaule: vauleItem,
      unit8Array: unit8ArrayNext,
      popped,
    } = decodeAndPopMidiData(unit8ArrayWorking);
    vaules.push(vauleItem);
    if (popped === 0) {
      encountedFailure = true;
      break;
    }
    unit8ArrayWorking = unit8ArrayNext;
    counter = counter - popped;
    depthStop -= 1;
  }

  return {
    data: vaules,
    unit8Array: unit8ArrayWorking,
    popped: encountedFailure === true ? 0 : vaules.length,
  };
}

export function decodeAndPopMidiData(unit8Array: Uint8Array<ArrayBuffer>): {
  vaule: ExactlyOneKeyValuePair<MidiData>;
  unit8Array: Uint8Array<ArrayBuffer>;
  popped: number;
} {
  const { bytes: commandByte, unit8Array: unit8Array1 } = decodeAndPopBytes(
    unit8Array,
    1,
  );
  const { number: command } = decodeAndPopUnsignedInit8Bit(commandByte);

  // Short channel commands
  if (command < 241) {
    // Get command and channe type
    const commandSection = SBitsArray.from(commandByte);

    const commandBits = SBitsArray.fromSBits(commandSection.slice(0, 4));
    commandBits.alignBytes();
    const { number: channelCommand } = decodeAndPopUnsignedInit8Bit(
      commandBits.unit8Array,
    );

    const channelBits = SBitsArray.fromSBits(commandSection.slice(5, 8));
    channelBits.alignBytes();
    const { number: channel } = decodeAndPopUnsignedInit8Bit(
      channelBits.unit8Array,
    );

    if (channelCommand === 8) {
      const { data, unit8Array: unit8ArrayNext } = popData3Byte(unit8Array1);
      return {
        vaule: {
          8: {
            command: 8,
            channel,
            label: "NoteOff",
            data,
          },
        },
        popped: 3,
        unit8Array: unit8ArrayNext,
      };
    }

    if (channelCommand === 9) {
      const { data, unit8Array: unit8ArrayNext } = popData3Byte(unit8Array1);
      return {
        vaule: {
          9: {
            command: 9,
            channel,
            label: "NoteOn",
            data,
          },
        },
        popped: 3,
        unit8Array: unit8ArrayNext,
      };
    }
    if (channelCommand === 10) {
      const { data, unit8Array: unit8ArrayNext } = popData3Byte(unit8Array1);
      return {
        vaule: {
          10: {
            command: 10,
            channel,
            label: "PolyphonicAftertouch",
            data,
          },
        },
        popped: 3,
        unit8Array: unit8ArrayNext,
      };
    }

    if (channelCommand === 11) {
      const { data, unit8Array: unit8ArrayNext } = popData3Byte(unit8Array1);
      return {
        vaule: {
          11: {
            command: 11,
            channel,
            label: "ControlChange",
            data,
          },
        },
        popped: 3,
        unit8Array: unit8ArrayNext,
      };
    }
    if (channelCommand === 12) {
      const { data, unit8Array: unit8ArrayNext } = popData2Byte(unit8Array1);
      return {
        vaule: {
          12: {
            command: 12,
            channel,
            label: "ProgramChange",
            data,
          },
        },
        popped: 2,
        unit8Array: unit8ArrayNext,
      };
    }
    if (channelCommand === 13) {
      const { data, unit8Array: unit8ArrayNext } = popData2Byte(unit8Array1);
      return {
        vaule: {
          13: {
            command: 13,
            channel,
            label: "ChannelAftertouch",
            data,
          },
        },
        popped: 2,
        unit8Array: unit8ArrayNext,
      };
    }
    if (channelCommand === 14) {
      const { data, unit8Array: unit8ArrayNext } = popData3Byte(unit8Array1);
      return {
        vaule: {
          14: {
            command: 14,
            channel,
            label: "PitchBend",
            data,
          },
        },
        popped: 3,
        unit8Array: unit8ArrayNext,
      };
    }
    //
  }

  // System Exclusive
  if (command === 240) {
    const {
      unit8Array: unit8ArrayNext,
      popped,
      bytes,
    } = decodeAndPopTerminatedBytes({
      unit8Array: unit8Array1,
      terminator: LABEL_TO_MIDI_LOOK_UP.SystemExclusiveEnd,
    });

    return {
      vaule: {
        240: {
          command: 240,
          label: "SystemExclusiveStart",
          data: bytes,
        },
      },
      unit8Array: unit8ArrayNext,
      popped: popped !== 0 ? popped + 1 : 0,
    };
  }

  // Long Commands
  if (command === 241) {
    const { data, unit8Array: unit8ArrayNext } = popData2Byte(unit8Array1);
    return {
      vaule: {
        241: {
          command: 241,
          label: "TimeCodeQuarterFrame",
          data,
        },
      },
      popped: 2,
      unit8Array: unit8ArrayNext,
    };
  }

  if (command === 242) {
    const { data, unit8Array: unit8ArrayNext } = popData3Byte(unit8Array1);
    return {
      vaule: {
        242: {
          command: 242,
          label: "SongPositionPointer",
          data,
        },
      },
      popped: 3,
      unit8Array: unit8ArrayNext,
    };
  }

  if (command === 243) {
    const { data, unit8Array: unit8ArrayNext } = popData2Byte(unit8Array1);
    return {
      vaule: {
        243: {
          command: 243,
          label: "SongSelect",
          data,
        },
      },
      popped: 2,
      unit8Array: unit8ArrayNext,
    };
  }

  if (command === 246) {
    return {
      vaule: {
        246: {
          command: 246,
          label: "TuneRequest",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 248) {
    return {
      vaule: {
        248: {
          command: 248,
          label: "TimingClock",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 250) {
    return {
      vaule: {
        250: {
          command: 250,
          label: "Start",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 251) {
    return {
      vaule: {
        251: {
          command: 251,
          label: "Continue",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 252) {
    return {
      vaule: {
        252: {
          command: 252,
          label: "Stop",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 254) {
    return {
      vaule: {
        254: {
          command: 254,
          label: "ActiveSensing",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 255) {
    return {
      vaule: {
        255: {
          command: 255,
          label: "SystemReset",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  // Undefined
  if (command === 244) {
    return {
      vaule: {
        244: {
          command: 244,
          label: "Undefined",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 245) {
    return {
      vaule: {
        245: {
          command: 245,
          label: "Undefined",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 249) {
    return {
      vaule: {
        249: {
          command: 249,
          label: "Undefined",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  if (command === 253) {
    return {
      vaule: {
        253: {
          command: 253,
          label: "Undefined",
        },
      },
      popped: 1,
      unit8Array: unit8Array1,
    };
  }

  // Fail Mode
  return {
    vaule: {
      253: {
        command: 253,
        label: "Undefined",
      },
    },
    popped: 0,
    unit8Array: unit8Array1,
  };
}
