import type { CampusLocation, VerificationMode } from "@/types/game";
import type { PositionProvider } from "@/game/movement/position-provider";
export interface VerificationResult {
  verified: boolean;
  mode: VerificationMode;
  code?: string;
  reason?: string;
}
/** GPS, QR and vision adapters will provide evidence behind this async contract. */
export interface LocationVerificationProvider {
  verify(location: CampusLocation): Promise<VerificationResult>;
}
export class ProximityVerificationProvider implements LocationVerificationProvider {
  constructor(private positions: PositionProvider) {}
  async verify(location: CampusLocation): Promise<VerificationResult> {
    const p = this.positions.getPosition();
    const verified =
      location.verificationModes.includes("proximity") &&
      (!this.positions.getWorldLocation ||
        (this.positions.getWorldLocation().floorId === location.floorId &&
          this.positions.getWorldLocation().buildingId ===
            location.buildingId)) &&
      Math.hypot(
        p.x - location.worldPosition.x,
        p.y - location.worldPosition.y,
      ) <= location.interactionRadius;
    return {
      verified,
      mode: "proximity",
      reason: verified ? undefined : "Move closer to the location marker.",
    };
  }
}
