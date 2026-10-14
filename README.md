# @joue-bien/rtp-midi-transport

A TypeScript library for sending controller MIDI messages over UDP without a driver, in compliance with Apple's RTP implementation.

# Install

`npm install  @joue-bien/rtp-midi-transport`

# Documentation

Documentation can be found on the projects [GitHub Wiki](https://github.com/JoueBien/rtp-midi-transport/wiki)

# Further reading

- [dgram](https://nodejs.org/api/dgram.html) - Node's socket Documentation.
- [Apple MIDI](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/MIDINetworkDriverProtocol/MIDI/MIDI.html#//apple_ref/doc/uid/TP40017273-CH2-DontLinkElementID_8) - MIDI Network Driver Protocol.
- [RFC 6295 3.2](https://www.rfc-editor.org/rfc/rfc6295.html) - RTP Payload Format for MIDI.
- [MIDI 1.0 summary](https://midi.org/summary-of-midi-1-0-messages)
- [@joue-bien/audio-transport](https://github.com/JoueBien/audio-transport#readme) - The library used for the underlying UDP transport.
- [Fail Up](https://www.npmjs.com/package/fail-up) - The error handling library.
