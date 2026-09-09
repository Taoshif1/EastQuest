# Future QR checkpoints

Keep scanners outside QuestEngine. A React checkpoint mini-game obtains camera
permission, captures a code, and passes evidence to QrVerificationProvider.
The provider implements LocationVerificationProvider.verify and returns a verified
result only after validating the expected checkpoint.

A composite provider can require both geographic proximity and QR evidence.
Use signed checkpoint payloads with location ID, version, expiry or rotating nonce.
A trusted server validates signature, replay protection and user/session binding.
Never put signing secrets in QR-rendering browser code.
Handle wrong checkpoint, expired code, denied camera permission and offline state.
Physical QR placement needs campus approval. No scanner package is installed in V0.
