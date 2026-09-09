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

## Ethical future dataset plan

This is a planning document. Do not begin collection automatically or install ML
packages for V0.1. Obtain permission from the campus and owners of each target first.
Approved campus signs, room/location markers, facilities and landmarks are possible
object classes. The system must identify CAMPUS OBJECTS / LANDMARKS, never people.
Do not scrape student faces or build face recognition.

Agree on targets, permitted capture areas, ownership, access, retention and deletion
before taking images. Frame scenes without people, ID cards, private documents or
screens; discard accidental personal captures instead of adding them to a dataset.
Keep a permission log and anonymous image IDs. Do not commit raw photos publicly.

Pipeline: images ? annotation ? train/validation/test split ? YOLO training ?
evaluation ? export ? VisionVerificationProvider.

1. Images: only approved objects, across permitted viewpoints, devices, distances
   and lighting. Include approved negative scenes without the target.
2. Annotation: label object classes and bounding boxes consistently. Have another
   team member review ambiguous labels; document the label rules.
3. Split before training by capture session/date/viewpoint where possible. Keep
   near-duplicates and frames from the same burst in one split to prevent leakage.
   Reserve a held-out test set; never tune thresholds on it.
4. YOLO training: select tooling later, keep model/data version records and training
   configuration, and respect dataset and model licenses.
5. Evaluation: measure per-class precision/recall, missed detections, false positives,
   unseen viewpoints, low light and replayed photos. Test phone latency and battery.
6. Export: compare exported model results with the trained model and record the
   class map, preprocessing, checksum, model version and measured thresholds.
7. VisionVerificationProvider: translate object evidence through the existing
   verification seam. Camera permission, inference and server reward authorization
   remain separate. A detected photo is not proof of physical presence.

Keep access limited to the team, define a deletion date, and provide a contact for
withdrawal/removal requests. Offer a non-camera route when vision is introduced.
