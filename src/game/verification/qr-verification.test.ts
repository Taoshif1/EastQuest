import { describe, expect, it } from "vitest";
import { checkpoints, parseQrPayload, payloadText } from "./checkpoints";
import { QrVerificationProvider } from "./qr-verification";
import { locations } from "@/game/data/campus/pois";

const valid = payloadText(checkpoints[0]);

describe("EastQuest QR checkpoints", () => {
  it("parses the registered library payload", () => {
    const result = parseQrPayload(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.checkpoint.locationId).toBe("library");
  });

  it.each([
    ["{", "MALFORMED_JSON"],
    [JSON.stringify({ ...JSON.parse(valid), version: 2 }), "UNSUPPORTED_VERSION"],
    [JSON.stringify({ ...JSON.parse(valid), issuedFor: "other" }), "WRONG_ISSUER"],
    [JSON.stringify({ ...JSON.parse(valid), checkpointId: "unknown" }), "UNKNOWN_CHECKPOINT"],
    [JSON.stringify({ ...JSON.parse(valid), locationId: "ics" }), "LOCATION_MISMATCH"],
  ])("rejects invalid payload (%s)", (payload, code) => {
    const result = parseQrPayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe(code);
  });

  it("rejects disabled checkpoints", () => {
    const result = parseQrPayload(valid, [{ ...checkpoints[0], enabled: false }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("CHECKPOINT_DISABLED");
  });

  it("verifies the library and rejects a different requested location", async () => {
    const provider = new QrVerificationProvider();
    const library = locations.find((location) => location.id === "library")!;
    const ics = locations.find((location) => location.id === "ics")!;
    expect((await provider.verify(library, valid)).verified).toBe(true);
    expect((await provider.verify(ics, valid)).verified).toBe(false);
  });

  it("maps an empty scan to a recoverable invalid result", async () => {
    const library = locations.find((location) => location.id === "library")!;
    const result = await new QrVerificationProvider().verify(library);
    expect(result).toMatchObject({ verified: false, mode: "qr" });
  });

  it("keeps checkpoint identifiers unique", () => {
    expect(new Set(checkpoints.map((checkpoint) => checkpoint.id)).size).toBe(checkpoints.length);
  });
});
