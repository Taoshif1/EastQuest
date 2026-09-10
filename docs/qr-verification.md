# QR checkpoint verification

V0.3A2 adds an optional QR evidence path without changing the original
proximity-based five-key quests. `QrVerificationProvider` implements the same
location verification abstraction used by `QuestEngine`; camera and scanner
code remain in the UI layer.

## V1 payload and registry

The typed registry is in `src/game/verification/checkpoints.ts`. The first
enabled experimental checkpoint is `ewu-library-b5`, for the Dr. S. R. Lasker
Library in Block B, Fifth Floor. Its payload is:

```json
{"version":1,"issuedFor":"eastquest","checkpointId":"ewu-library-b5","locationId":"library"}
```

The parser validates JSON, version, issuer, registry membership, enabled state,
and location matching. The development QR page is `/dev/checkpoints`; it is
not linked from normal gameplay.

## Scanner lifecycle and privacy

Scanning starts only after the player explicitly chooses the experimental
Library action. Native `BarcodeDetector` is used when available. Other browsers
lazy-load `@zxing/browser`. Camera tracks stop on success, cancel, close,
unmount, navigation, and unrecoverable errors. Camera frames are not uploaded
or stored.

Permission denial, unavailable cameras, unsupported scanning, malformed codes,
and wrong checkpoints are shown as recoverable UI errors. The proximity quest
path remains available if scanning fails.

## Security limits and future work

This static QR proves only that a payload has the expected format and registered
location. It can be copied or shared and is not cryptographic proof of presence.
Future versions can add signed payloads, server-authoritative validation,
expiration, rotating tokens, nonces, and one-time session checks without
changing `QuestEngine`.

For team testing, open `/dev/checkpoints` in a development environment, scan
the displayed Library code from a phone or second screen, then cancel and
confirm the game remains responsive. A real phone or webcam test is still
required for camera permissions and device-specific behavior.
