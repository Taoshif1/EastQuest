# Future GPS and PostGIS

V0 only uses fictional WorldPosition coordinates. No GPS permission is requested.

Future pipeline:
GeoPosition → GpsPositionProvider / source → CampusCoordinateMapper → WorldPosition.
PositionProvider remains the consumer boundary; quests do not read keyboard events.
GpsPositionSource and CampusCoordinateMapper are declared in position-provider.ts.
Implement a GPS adapter only after measuring real campus reference points and
agreeing a calibration. Never reuse logical pixels as latitude or longitude.

Account for browser permission denial, accuracy, stale fixes, indoor signal loss,
floor ambiguity, and spoofing. Keep last-fix time and accuracy in verification evidence.
GpsVerificationProvider can reject uncertain evidence, explain why, and offer
a future QR fallback. Mapping is for representation; geographic distances should
be verified geographically rather than in arbitrarily scaled canvas pixels.

For beta, add a PostGIS geography(Point,4326) column with GiST index through a
new migration. Use ST_DWithin(location, playerPoint, 25) to find active content
within 25 meters; geography distances use meters. Filter active quests and
campus boundaries. Supply longitude before latitude to ST_MakePoint.
No PostGIS extension is required by the V0 migration.
Keep location retention minimal, ask explicit permission, and verify RLS on any
stored player location. Calibrate with real EWU field research before deployment.
