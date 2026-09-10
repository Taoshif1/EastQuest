import { buildings } from "../buildings";
import { approximate, field, planEvidence } from "../evidence";
import type {
  Area,
  BuildingId,
  Floor,
  FloorId,
  Rect,
} from "../types";

const names = [
  "Lower Basement",
  "Upper Basement",
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Third Floor",
  "Fourth Floor",
  "Fifth Floor",
  "Sixth Floor",
  "Seventh Floor",
  "Eighth Floor",
  "Roof Deck",
];
export function contains(r: Rect, p: { x: number; y: number }, margin = 0) {
  return (
    p.x >= r.x - margin &&
    p.y >= r.y - margin &&
    p.x <= r.x + r.width + margin &&
    p.y <= r.y + r.height + margin
  );
}
export function makeFloor(
  id: FloorId,
  order: number,
  source: string,
  notes: string,
): Floor {
  const f: Floor = {
    id,
    name: names[order + 2],
    order,
    source,
    notes,
    access: id === "roof-deck" ? "REFERENCE_ONLY" : "EXPLORATION",
    evidence: planEvidence(source, notes),
    areas: [],
    walls: [],
    objects: [],
    labels: [],
  };
  const area = (
    id: string,
    name: string,
    r: Rect,
    buildingId: BuildingId | null,
    material: Area["material"] = "tile",
  ) =>
    f.areas.push({
      ...r,
      id,
      name,
      buildingId,
      material,
      evidence: approximate(
        "Playable geometry traced by proportions from " +
          source +
          "; doors and furnishings simplified.",
      ),
    });
  const room = (
    r: Rect,
    label: string,
    style: "office" | "classroom" | "library" | "lab" = "office",
    doorSide: "top" | "bottom" = "bottom",
  ) => {
    const gap = 64,
      mid = r.x + r.width / 2;
    f.walls.push(
      { x: r.x, y: r.y, width: 9, height: r.height },
      { x: r.x + r.width - 9, y: r.y, width: 9, height: r.height },
    );
    const doorY = doorSide === "bottom" ? r.y + r.height - 9 : r.y;
    const solidY = doorSide === "bottom" ? r.y : r.y + r.height - 9;
    f.walls.push(
      { x: r.x, y: solidY, width: r.width, height: 9 },
      { x: r.x, y: doorY, width: r.width / 2 - gap / 2, height: 9 },
      { x: mid + gap / 2, y: doorY, width: r.width / 2 - gap / 2, height: 9 },
    );
    f.objects.push({
      kind: "door",
      x: mid - gap / 2,
      y: doorY,
      width: gap,
      height: 9,
    });
    f.labels.push({ x: mid, y: r.y + 24, text: label });
    if (style === "office") {
      f.objects.push(
        {
          kind: "desk",
          x: r.x + 25,
          y: r.y + 45,
          width: 46,
          height: 25,
          solid: true,
        },
        {
          kind: "chair",
          x: r.x + 37,
          y: r.y + 78,
          width: 20,
          height: 18,
          solid: true,
        },
      );
    } else {
      for (let x = r.x + 24; x < r.x + r.width - 55; x += 70)
        for (let y = r.y + 50; y < r.y + r.height - 40; y += 54)
          f.objects.push({
            kind: style === "library" ? "shelf" : "table",
            x,
            y,
            width: 42,
            height: 22,
            solid: true,
          });
    }
  };
  for (const b of buildings) {
    if (b.id === "fub" || order > b.highest) continue;
    const r = b.bounds;
    area(b.id, b.name, r, b.id, order < 0 ? "parking" : "tile");
    f.labels.push({
      x: r.x + r.width / 2,
      y: r.y + 15,
      text: b.name.toUpperCase(),
    });
    if (order < 0) continue;
    if (b.id === "b" && order === 5) {
      // Open stacks and reading hall replace the double classroom corridor.
      for (let x = 530; x < 1030; x += 80)
        for (let y = 165; y < 400; y += 160)
          f.objects.push({
            kind: "shelf",
            x,
            y,
            width: 42,
            height: 75,
            solid: true,
          });
      f.labels.push({ x: 780, y: 290, text: "DR. S. R. LASKER LIBRARY" });
    } else if (b.id === "b") {
      for (let i = 0; i < (order === 4 ? 3 : 4); i++) {
        const w = 560 / (order === 4 ? 3 : 4);
        room(
          { x: r.x + i * w, y: 125, width: w, height: 105 },
          order === 4 ? "COMPUTER LAB" : "CLASSROOM",
          order === 4 ? "lab" : "classroom",
        );
        const left = r.x + i * w,
          right = left + w;
        // Central courtyard stair/circulation opening between the classroom bands.
        const segments = [
          { x: left, end: Math.min(right, 760) },
          { x: Math.max(left, 800), end: right },
        ];
        for (const segment of segments)
          if (segment.end - segment.x > 45)
            room(
              {
                x: segment.x,
                y: 330,
                width: segment.end - segment.x,
                height: 110,
              },
              "LEARNING SPACE",
              "classroom",
              "top",
            );
      }
    } else if (b.id === "d") {
      if (order === 0) {
        room(
          { x: 530, y: 835, width: 460, height: 255 },
          "MANZUR ELAHI AUDITORIUM",
          "office",
          "top",
        );
        f.objects.splice(-2);
        f.objects.push({
          kind: "auditorium",
          x: 555,
          y: 880,
          width: 410,
          height: 185,
        });
      } else {
        room(
          { x: 530, y: 930, width: 235, height: 180 },
          order === 1 ? "MEDICAL CENTER" : "SERVICE OFFICE",
          "office",
          "top",
        );
        room(
          { x: 775, y: 930, width: 250, height: 180 },
          "AUDITORIUM GALLERY",
          "office",
          "top",
        );
        f.objects.splice(-2);
        f.objects.push({
          kind: "auditorium",
          x: 790,
          y: 965,
          width: 215,
          height: 130,
        });
      }
    } else if (b.id === "admin") {
      const labels =
        order === 0
          ? ["RECEPTION", "OFFICE", "OFFICE", "WAITING"]
          : order === 1
            ? ["ADMISSION OFFICE", "BANK / ACCOUNTS", "WAITING", "OFFICE"]
            : order === 2
              ? [
                  "CAREER COUNSELING",
                  "STUDENT WELFARE",
                  "SERVICE OFFICE",
                  "OFFICE",
                ]
              : ["OFFICE", "OFFICE", "OFFICE", "OFFICE"];
      for (let i = 0; i < 4; i++) {
        const y = 490 + i * 150;
        room({ x: 1080, y, width: 115, height: 110 }, labels[i]);
        room({ x: 1300, y, width: 100, height: 110 }, "OFFICE");
      }
      f.objects.push({
        kind: "bench",
        x: 1205,
        y: 1030,
        width: 64,
        height: 20,
        solid: true,
      });
    } else if (b.id === "c-middle") {
      if (order <= 4) {
        room(
          { x: 170, y: 470, width: 150, height: 270 },
          "LECTURE GALLERY",
          "office",
        );
        f.objects.splice(-2);
        f.objects.push({
          kind: "gallery",
          x: 185,
          y: 520,
          width: 120,
          height: 195,
        });
      } else {
        // The gallery becomes a roof terrace; the eastern teaching strip continues.
        f.walls.push({ x: 170, y: 470, width: 150, height: 270 });
        f.objects.push({
          kind: "lightwell",
          x: 170,
          y: 470,
          width: 150,
          height: 270,
        });
        f.labels.push({ x: 245, y: 570, text: "GALLERY ROOF" });
      }
      room({ x: 390, y: 470, width: 80, height: 125 }, "ROOM");
    } else {
      // Courtyard lightwells and perimeter room bands recur in A and C wings.
      f.walls.push({ x: r.x + 95, y: r.y + 155, width: 90, height: 60 });
      f.objects.push({
        kind: "lightwell",
        x: r.x + 95,
        y: r.y + 155,
        width: 90,
        height: 60,
      });
      f.labels.push({ x: r.x + 140, y: r.y + 175, text: "LIGHTWELL" });
      room({ x: r.x + 10, y: r.y + 30, width: 125, height: 90 }, "OFFICE");
      room(
        { x: r.x + 205, y: r.y + 30, width: 105, height: 90 },
        order === 8 ? "SOCIAL RELATIONS" : "TEACHING SPACE",
      );
      room(
        { x: r.x + 10, y: r.y + 255, width: 120, height: 80 },
        "ROOM",
        "office",
        "top",
      );
      room(
        { x: r.x + 220, y: r.y + 255, width: 90, height: 80 },
        "ROOM",
        "office",
        "top",
      );
    }
  }
  // Narrow inter-block links. Official connectivity exceptions are structural barriers.
  const link = (a: BuildingId, b: BuildingId, r: Rect, allowed: boolean) => {
    if (
      allowed &&
      f.areas.some((x) => x.id === a) &&
      f.areas.some((x) => x.id === b)
    )
      area(a + "-" + b, "Connecting corridor", r, a, "stone");
  };
  link("c-north", "b", { x: 480, y: 245, width: 20, height: 70 }, order !== 5);
  link("b", "a", { x: 1060, y: 245, width: 20, height: 70 }, order !== 7);
  link(
    "a",
    "admin",
    { x: 1210, y: 440, width: 70, height: 20 },
    order !== 1 && order !== 5,
  );
  link(
    "c-north",
    "c-middle",
    { x: 325, y: 440, width: 60, height: 20 },
    order !== 7 && order !== 8,
  );
  link(
    "c-middle",
    "c-south",
    { x: 325, y: 780, width: 60, height: 20 },
    order !== 7,
  );
  link("d", "admin", { x: 1060, y: 825, width: 20, height: 110 }, order <= 2);
  if (order === 0) {
    area(
      "court",
      "EWU Courtyard",
      { x: 500, y: 460, width: 560, height: 320 },
      null,
      "outdoor",
    );
    area(
      "east-walk",
      "Internal walkway",
      { x: 1060, y: 460, width: 20, height: 320 },
      "admin",
      "stone",
    );
    area(
      "west-walk",
      "Courtyard arcade",
      { x: 480, y: 460, width: 20, height: 320 },
      "c-middle",
      "stone",
    );
    area(
      "north-walk",
      "Courtyard arcade",
      { x: 500, y: 440, width: 560, height: 20 },
      "b",
      "stone",
    );
    area(
      "south-walk",
      "Courtyard arcade",
      { x: 500, y: 780, width: 560, height: 20 },
      "d",
      "stone",
    );
    area(
      "entry",
      "Entry circulation",
      { x: 1170, y: 1140, width: 200, height: 340 },
      null,
      "stone",
    );
    area(
      "forecourt",
      "Main Outer Gate",
      { x: 1080, y: 1440, width: 380, height: 100 },
      null,
      "outdoor",
    );
    area(
      "fub-approach",
      "FUB exterior approach",
      { x: 350, y: 1140, width: 100, height: 120 },
      "c-south",
      "outdoor",
    );
    f.areas.find((a) => a.id === "entry")!.evidence = field(
      "Outer gate → security scanner → raised entry → punch gate → internal circulation. Dimensions unmeasured.",
    );
    f.objects.push(
      { kind: "gate", x: 1170, y: 1440, width: 200, height: 22 },
      { kind: "scanner", x: 1190, y: 1350, width: 60, height: 72, solid: true },
      { kind: "counter", x: 1320, y: 1360, width: 40, height: 65, solid: true },
      { kind: "stairs", x: 1200, y: 1280, width: 145, height: 55 },
      { kind: "punch", x: 1200, y: 1210, width: 25, height: 50, solid: true },
      { kind: "punch", x: 1280, y: 1210, width: 25, height: 50, solid: true },
      { kind: "punch", x: 1340, y: 1210, width: 25, height: 50, solid: true },
      { kind: "notice", x: 1380, y: 1200, width: 45, height: 60 },
    );
    f.labels.push(
      { x: 1270, y: 1505, text: "EAST WEST UNIVERSITY" },
      { x: 1270, y: 1425, text: "01  MAIN OUTER GATE" },
      { x: 1295, y: 1343, text: "02  SECURITY CHECK" },
      { x: 1270, y: 1185, text: "03  PUNCH GATE" },
      { x: 780, y: 603, text: "EWU COURTYARD" },
      { x: 780, y: 629, text: "Your Campus. Your Quest." },
      { x: 320, y: 1270, text: "FARASHUDDIN BUILDING" },
      { x: 320, y: 1295, text: "FUB · exterior reference" },
    );
    for (const x of [535, 990])
      for (const y of [490, 710])
        f.objects.push({
          kind: "tree",
          x,
          y,
          width: 40,
          height: 40,
          solid: true,
        });
    for (const x of [625, 840])
      for (const y of [480, 735])
        f.objects.push({
          kind: "bench",
          x,
          y,
          width: 80,
          height: 22,
          solid: true,
        });
  } else if (order < 0) {
    // Basement parking is continuous beneath the courtyard and block joints.
    // Keep block areas first for location identity, then fill the structural seams.
    area(
      "parking-plate",
      "Continuous basement parking",
      { x: 160, y: 100, width: 1240, height: 1040 },
      null,
      "parking",
    );
    area(
      "parking",
      "Basement circulation",
      { x: 480, y: 440, width: 600, height: 360 },
      null,
      "parking",
    );
    for (let x = 530; x < 1020; x += 100)
      for (let y = 180; y < 750; y += 130)
        f.objects.push({
          kind: "pillar",
          x,
          y,
          width: 16,
          height: 16,
          solid: true,
        });
    if (order === -1) {
      f.objects.push({
        kind: "counter",
        x: 520,
        y: 865,
        width: 220,
        height: 30,
        solid: true,
      });
      f.labels.push({ x: 780, y: 840, text: "CANTEEN · BLOCK D" });
      for (let x = 550; x < 1020; x += 95)
        for (let y = 950; y < 1100; y += 70)
          f.objects.push({
            kind: "table",
            x,
            y,
            width: 50,
            height: 32,
            solid: true,
          });
      f.objects.push({
        kind: "counter",
        x: 530,
        y: 870,
        width: 160,
        height: 32,
        solid: true,
      });
    } else {
      room(
        { x: 530, y: 870, width: 110, height: 230 },
        "SERVICE",
        "office",
        "top",
      );
      room(
        { x: 645, y: 870, width: 110, height: 230 },
        "STORAGE",
        "office",
        "top",
      );
      f.labels.push({ x: 905, y: 1000, text: "COMMON ROOM / PLAYGROUND" });
    }
  } else {
    // Unoccupied roofs are context, not walkable shortcuts.
    f.labels.push({ x: 780, y: 603, text: "COURTYARD BELOW" });
    if (order >= 6)
      f.labels.push({ x: 780, y: 270, text: "BLOCK B ROOF · NO ACCESS" });
  }
  // Column rhythm beside courtyard edges, kept outside travel lanes.
  if (order >= 0 && order <= 5)
    for (let x = 535; x < 1050; x += 80)
      if (x < 750 || x > 810)
        f.objects.push({
          kind: "pillar",
          x,
          y: 448,
          width: 12,
          height: 12,
          solid: true,
        });
  return f;
}
