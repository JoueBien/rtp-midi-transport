# @joue-bien/rtp-midi-transport

A TypeScript library for sending MIDI messages over UDP without a driver, in compliance with Apple's RTP implementation.

# Install

`npm install`

# Documintation

Documintation can be found on the projects [GitHub Wiki](https://github.com/JoueBien/rtp-midi-transport/wiki)

# Limitations disclaimer

This library is focused on MIDI controllers and not real-time music playback. As control is the focus, there are a number of features that have not been implemented. I don't particularly like MIDI, so It's more or less implement as much as I need to be able to work with an X-Touch/X-Touch Extender/MC Hardware.

If there is a missing feature you need, don't expect it to be added any time soon. Merge requests are welcome if you want to add or fix a missing feature.

## Never going to be implemented

- Bonjour - I don't plan on reverse engneering the descoverly layer Apple tacked on to their RTP MIDI specification.

## Limitations

- Recovery journal handling. I'm mainly focused on hardware surfaces, so this isn't a feature I need, and it's a pain to implement.
- Timestamp of MIDI messages interlacing. I'm mainly focused on hardware surfaces, so this isn't a feature I need, and it's a pain to implement.
- System Extended Decoding - I do need this feature, but not to the extent that I want to implement the ID decoding. Currently, the data bytes of the System Extended message will always come out as a buffer. You'll have to decode the ID codes and the subsequent data on your own. Honestly, if you need System Extended, you should be using Open Sound Control.
- Setting the running status flag in the header. When encoding the running status, it will always be false (a completely unnecessary feature). The decoder is capable of reading the status byte value in the headers.
- The server transport only handles parsing and message events. You will need to implement your own IN/OK handshake logic, BY logic, NO logic, CK startup spam, CK pulse and keep track of current clients.
- Keeping track of the clock difference between two devices. Clock exchanges are handled on both the client and server; however, only enough to keep the two devices talking to each other through the clock pulse system. If you need to calculate the difference in time between the server and client, you will need to do that on your own by listening for CK events.
- Enforcing Apple's MIDI subheader. During decoding, the decoder skips checking most of the MIDI message subheader because we assume you are sending compliant messages. Why? The X-Touch doesn't and sets a single flag to the wrong value.

# Further reading

- [dgram](https://nodejs.org/api/dgram.html) - Node's socket Documentation.
- [Apple MIDI](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/MIDINetworkDriverProtocol/MIDI/MIDI.html#//apple_ref/doc/uid/TP40017273-CH2-DontLinkElementID_8) - MIDI Network Driver Protocol.
- [RFC 6295 3.2](https://www.rfc-editor.org/rfc/rfc6295.html) - RTP Payload Format for MIDI.
- [MIDI 1.0 summary](https://midi.org/summary-of-midi-1-0-messages)
- [@joue-bien/audio-transport](https://github.com/JoueBien/audio-transport#readme) - The library used for the underlying UDP transport.
- [Fail Up](https://www.npmjs.com/package/fail-up) - The error handling library.
