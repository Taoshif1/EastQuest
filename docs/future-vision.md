# Future computer vision / YOLO

A future mission: Find the requested campus landmark.
The React mini-game opens a permission-based camera view and provides frames
to an object-detector adapter. VisionVerificationProvider consumes detector evidence
(target class, confidence, capture time, model version, and quest/session binding)
and implements LocationVerificationProvider. QuestEngine still calls verify(location)
and handles prerequisites/rewards; it never imports YOLO or camera libraries.

Potential pipeline:
camera frame → object detector → target class + confidence → verification provider
→ QuestEngine completion → atomic repository transaction.
Camera capture and inference belong to separate adapters so one can be replaced
without changing the other. Provider instances can receive the current evidence
through an evidence-store dependency; raw frames do not belong in GameSave.

Research YOLO-family models with a consented custom EWU landmark dataset.
Evaluate ONNX export, ONNX Runtime Web, WebGPU acceleration, and server inference
based on device support and measured accuracy. Include CPU fallback and limits.
Measure false positives, lighting, viewpoints, latency, battery and model download size.
Choose thresholds from held-out data rather than guessing a confidence number.
A visible landmark prediction is not automatically proof of physical presence:
consider replayed photos, freshness, proximity and server-side anti-abuse requirements.

Request camera permission only during the mission. Avoid identifying people, keep
faces out of training data, prefer on-device processing, and discard frames by default.
Offer a non-camera alternative. Discuss image uploads and retention before adding them.
V0 installs no YOLO, TensorFlow, OpenCV, ONNX Runtime, WebGPU inference or camera ML stack.
