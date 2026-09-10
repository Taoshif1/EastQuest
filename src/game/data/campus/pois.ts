import type { CampusLocation } from "@/types/game";
import { official, approximate, field } from "./evidence";
export const locations: CampusLocation[] = [
  {
    id: "gate",
    slug: "main-gate",
    name: "Main Outer Gate",
    description:
      "Arrive through security, the entry stairs and punch gate, then explore the courtyard.",
    type: "entrance",
    buildingId: null,
    floorId: "ground",
    floor: "Ground Floor",
    worldPosition: { x: 1270, y: 1470 },
    interactionRadius: 75,
    verificationModes: ["proximity"],
    evidence: field(
      "Taoshif arrival sequence; gate dimensions and checkpoint positions need rechecking.",
    ),
  },
  {
    id: "library",
    slug: "library",
    name: "Dr. S. R. Lasker Library",
    description:
      "The university library: a place to read, research and discover dependable sources.",
    type: "learning",
    buildingId: "b",
    floorId: "fifth",
    floor: "Fifth Floor",
    worldPosition: { x: 935, y: 285 },
    interactionRadius: 65,
    verificationModes: ["proximity"],
    evidence: official(
      "Library listed in Block B, 5th floor. Game marker represents the library hall, not a verified desk.",
    ),
  },
  {
    id: "ics",
    slug: "computer-lab",
    name: "ICS Computer Lab",
    description: "Explore computing and practise careful problem solving.",
    type: "learning",
    buildingId: "b",
    floorId: "fourth",
    floor: "Fourth Floor",
    worldPosition: { x: 935, y: 280 },
    interactionRadius: 65,
    verificationModes: ["proximity"],
    evidence: official(
      "ICS Computer Lab is listed in Block B, 4th floor; distinct from the ICS office, whose public contact page lists A/3.",
    ),
  },
  {
    id: "career",
    slug: "career-center",
    name: "Career Counseling Center Lobby",
    description: "Find direction for internships, skills and your next step.",
    type: "career",
    buildingId: "admin",
    floorId: "second",
    floor: "Second Floor",
    worldPosition: { x: 1245, y: 570 },
    interactionRadius: 65,
    verificationModes: ["proximity"],
    evidence: official("Career Coun. Center Lobby listed in Admin, 2nd floor."),
  },
  {
    id: "support",
    slug: "medical-center",
    name: "Medical Center",
    description: "Knowing where to find campus health support matters.",
    type: "support",
    buildingId: "d",
    floorId: "first",
    floor: "First Floor",
    worldPosition: { x: 665, y: 890 },
    interactionRadius: 60,
    verificationModes: ["proximity"],
    evidence: official(
      "Medical Center listed in Block D, 1st floor; game marker placed at the foyer.",
    ),
  },
].map((l) => ({
  ...l,
  geometryEvidence: approximate(
    "Approximate reachable marker inside the documented block and floor; room number unverified.",
  ),
})) as CampusLocation[];
