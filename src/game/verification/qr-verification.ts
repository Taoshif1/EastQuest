import type { CampusLocation } from "@/types/game";
import type { LocationVerificationProvider, VerificationResult } from "./location-verification";
import { parseQrPayload, type QrPayloadError } from "./checkpoints";

export type QrVerificationCode =
  | "SUCCESS"
  | QrPayloadError
  | "WRONG_REQUESTED_LOCATION";

export class QrVerificationProvider implements LocationVerificationProvider {
  async verify(location: CampusLocation, rawPayload = ""): Promise<VerificationResult> {
    if (!rawPayload)
      return {
        verified: false,
        mode: "qr",
        code: "INVALID_PAYLOAD",
        reason: "Scan an EastQuest checkpoint QR code.",
      };
    const result = parseQrPayload(rawPayload);
    if (!result.ok)
      return {
        verified: false,
        mode: "qr",
        code: result.code,
        reason: result.message,
      };
    if (result.payload.locationId !== location.id)
      return {
        verified: false,
        mode: "qr",
        code: "WRONG_REQUESTED_LOCATION",
        reason: "This checkpoint is for a different campus location.",
      };
    return { verified: true, mode: "qr", code: "SUCCESS" };
  }
}
