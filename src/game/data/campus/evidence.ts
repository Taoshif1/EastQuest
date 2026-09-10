export type Evidence = {
  sourceType:
    | "OFFICIAL_SOURCE"
    | "FLOORPLAN_REFERENCE"
    | "FIELD_OBSERVED"
    | "APPROXIMATED";
  confidence: "VERIFIED" | "HIGH" | "MEDIUM" | "LOW";
  sourceRef: string;
  notes: string;
  verifiedBy: string | null;
  verifiedDate: string | null;
};
export const PUBLIC_MAP =
  "https://www.ewubd.edu/storage/app/media/about/about-ewu/Location%20Map.png";
export const official = (notes: string): Evidence => ({
  sourceType: "OFFICIAL_SOURCE",
  confidence: "VERIFIED",
  sourceRef: PUBLIC_MAP,
  notes,
  verifiedBy: "Public EWU access-map cross-check",
  verifiedDate: "2026-09-10",
});
export const planEvidence = (file: string, notes: string): Evidence => ({
  sourceType: "FLOORPLAN_REFERENCE",
  confidence: "HIGH",
  sourceRef: "references/ewu-floorplans/" + file,
  notes,
  verifiedBy: null,
  verifiedDate: null,
});
export const approximate = (notes: string): Evidence => ({
  sourceType: "APPROXIMATED",
  confidence: "MEDIUM",
  sourceRef: "docs/v0.2-map-notes.md",
  notes,
  verifiedBy: null,
  verifiedDate: null,
});
export const field = (notes: string): Evidence => ({
  sourceType: "FIELD_OBSERVED",
  confidence: "MEDIUM",
  sourceRef: "Taoshif arrival field notes, supplied 2026-09-10",
  notes,
  verifiedBy: null,
  verifiedDate: null,
});
