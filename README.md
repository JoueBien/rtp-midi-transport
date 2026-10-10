# @joue-bien/rtp-midi-transport

A TypeScript library for sending controller MIDI messages over UDP without a driver, in compliance with Apple's RTP implementation.

# Install

`npm install  @joue-bien/rtp-midi-transport`

# Documintation

Documintation can be found on the projects [GitHub Wiki](https://github.com/JoueBien/rtp-midi-transport/wiki)

# Further reading

- [dgram](https://nodejs.org/api/dgram.html) - Node's socket Documentation.
- [Apple MIDI](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/MIDINetworkDriverProtocol/MIDI/MIDI.html#//apple_ref/doc/uid/TP40017273-CH2-DontLinkElementID_8) - MIDI Network Driver Protocol.
- [RFC 6295 3.2](https://www.rfc-editor.org/rfc/rfc6295.html) - RTP Payload Format for MIDI.
- [MIDI 1.0 summary](https://midi.org/summary-of-midi-1-0-messages)
- [@joue-bien/audio-transport](https://github.com/JoueBien/audio-transport#readme) - The library used for the underlying UDP transport.
- [Fail Up](https://www.npmjs.com/package/fail-up) - The error handling library.

# Supported features

This library focuses on MIDI controllers, not real-time music playback. As control is the focus, there are a number of features that have not been fully implemented. Merge requests are welcome if you want to add a feature or fix a missing feature.

| Feature                                                     | Supported | Notes                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client side connection handshake and sending Midi messages. | ✅        | Supported.                                                                                                                                                                                                                                                                                                    |
| Server side connection handshake and sending Midi messages. | ✅        | Keeping track of connected clients must be implemented on your own.                                                                                                                                                                                                                                           |
| Sending and receiving midi lists                            | ✅        | Supports encoding and decoding multiple midi messages in the midi list section.                                                                                                                                                                                                                               |
| System extended Messages                                    | ✅        | Decodes as a buffer. You will need to encode and decode the System extended header on your own.                                                                                                                                                                                                               |
| Test tools                                                  | ✅        | [vitest](https://vitest.dev/) utilities are supported for easily setting up both the server and client in tests.                                                                                                                                                                                              |
| Byte timestamps in midi list.                               | ❌        | Decoding or encoding the interlaced of timestamps in the Midi list is not supported.                                                                                                                                                                                                                          |
| Enforcing Apple's MIDI subheader                            | ⚠️        | During decoding, the decoder skips checking most of the MIDI message subheader because we assume you are sending compliant messages. Why? The X-Touch doesn't and sets a single flag to the wrong value.                                                                                                      |
| Recovery journal handling.                                  | ❌        | Not supported, the decoder will skip journal sections. There is no journal encode support.                                                                                                                                                                                                                    |
| Setting the running status flag in the header.              | ⚠️        | This flag can't be set in the encoder. It is exposed in the decoder.                                                                                                                                                                                                                                          |
| Clock offset tracking.                                      | ⚠️        | Clock exchanges are handled on both the client and server; however, only enough to keep the two devices talking to each other through the clock pulse system. If you need to calculate the difference in time between the server and client, you will need to do that on your own by listening for CK events. |
| No Bonjour Support.                                         | ❌        | This library does not implement Apples discovery layer. If you need Bonjour support use [bonjour](https://www.npmjs.com/package/bonjour).                                                                                                                                                                     |
