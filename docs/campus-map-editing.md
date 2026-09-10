# Editing the EWU campus

1. Read the relevant floor's module and local drawing, then check the source register.
2. Edit the existing factory for repeated architecture; keep level-specific differences conditional on floor/order. Do not copy the renderer into floor data.
3. Areas define walkable floor plates. Walls and solid objects define collision. Keep enough clearance for the centred 18px avatar and the same 9px half-body used by save validation.
4. Connections keep stable building/core IDs and validated service lists. Stairs use adjacent valid floors only. Never add a floor just to make a quest reachable.
5. POIs must have evidence independent of coordinate confidence. Do not upgrade an approximate room location to VERIFIED because its block/floor is documented.
6. Run tests, typecheck, then walk the changed routes with real Phaser input. A walkable marker can still be isolated.

## Development calibration

Keep original drawings locally in references/ewu-floorplans using registered filenames.
Start npm run dev and open /game?debug=1. Walk to a lift and select the floor to inspect.
Enable Blueprint reference; switch Colored plan on/off to compare both variants.
Per-reference normalized footprint bounds exclude drawing legends. Offset X/Y,
scale and opacity permit alignment inspection without editing player coordinates.
Reset alignment restores defaults. Collision overlay shows the actual physics
bounds. Calibration event state survives scene transitions.

The rectified game footprint cannot exactly overlay skewed architectural lines.
Use courtyard corners, block extents, main circulation and cores as landmarks;
correct large navigation/silhouette discrepancies in data, not by stretching the
reference until an incorrect route appears correct. Record remaining residuals.

The API accepts registered floor IDs and a mono/color variant only. In production
and preview production-mode builds it returns 404 before reading files. Drawings
are outside public/ and ignored in both Git and deployment uploads. Never commit
original reference images or turn them into game textures.
