import type { BuildingId, FloorId } from "@/game/data/campus/types";

export type Checkpoint = {
  id: string;
  displayName: string;
  locationId: string;
  buildingId: BuildingId;
  floorId: FloorId;
  verificationType: "QR";
  enabled: boolean;
};

export const checkpoints: readonly Checkpoint[] = [
  {
    id: "ewu-library-b5",
    displayName: "Library Test Checkpoint",
    locationId: "library",
    buildingId: "b",
    floorId: "fifth",
    verificationType: "QR",
    enabled: true,
  },
];

export type QrPayload = {
  version: 1;
  issuedFor: "eastquest";
  checkpointId: string;
  locationId: string;
};

export type QrPayloadError =
  | "MALFORMED_JSON"
  | "UNSUPPORTED_VERSION"
  | "WRONG_ISSUER"
  | "UNKNOWN_CHECKPOINT"
  | "CHECKPOINT_DISABLED"
  | "LOCATION_MISMATCH";

export type QrPayloadResult =
  | { ok: true; payload: QrPayload; checkpoint: Checkpoint }
  | { ok: false; code: QrPayloadError; message: string };

export function payloadForCheckpoint(checkpoint: Checkpoint): QrPayload {
  return {
    version: 1,
    issuedFor: "eastquest",
    checkpointId: checkpoint.id,
    locationId: checkpoint.locationId,
  };
}

export function payloadText(checkpoint: Checkpoint) {
  return JSON.stringify(payloadForCheckpoint(checkpoint));
}

export function parseQrPayload(
  raw: string,
  registry: readonly Checkpoint[] = checkpoints,
): QrPayloadResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, code: "MALFORMED_JSON", message: "This is not a valid EastQuest QR payload." };
  }
  if (!value || typeof value !== "object") {
    return { ok: false, code: "MALFORMED_JSON", message: "This QR payload is not an object." };
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== 1)
    return { ok: false, code: "UNSUPPORTED_VERSION", message: "This QR version is not supported." };
  if (candidate.issuedFor !== "eastquest")
    return { ok: false, code: "WRONG_ISSUER", message: "This QR code was not issued for EastQuest." };
  if (typeof candidate.checkpointId !== "string" || typeof candidate.locationId !== "string")
    return { ok: false, code: "MALFORMED_JSON", message: "This QR payload is missing checkpoint details." };
  const checkpoint = registry.find((item) => item.id === candidate.checkpointId);
  if (!checkpoint)
    return { ok: false, code: "UNKNOWN_CHECKPOINT", message: "This checkpoint is not registered." };
  if (!checkpoint.enabled)
    return { ok: false, code: "CHECKPOINT_DISABLED", message: "This checkpoint is currently disabled." };
  if (checkpoint.locationId !== candidate.locationId)
    return { ok: false, code: "LOCATION_MISMATCH", message: "This QR code does not match its checkpoint location." };
  return {
    ok: true,
    checkpoint,
    payload: {
      version: 1,
      issuedFor: "eastquest",
      checkpointId: candidate.checkpointId,
      locationId: candidate.locationId,
    },
  };
}
