import * as Phaser from "phaser";
import {
  buildings,
  collisionRects,
  connectionsOn,
  floorById,
  WORLD,
} from "@/game/data/campus/index";
import { locations } from "@/game/data/campus/pois";
import type { MapObject } from "@/game/data/campus/types";

const P = {
  ink: 0x334444,
  wall: 0x976f5e,
  cap: 0xc29d83,
  stone: 0xd8d6c9,
  tile: 0xe6e2d6,
  wood: 0xcbb697,
  outdoor: 0xc5cbb8,
  terrace: 0xb1b7aa,
  parking: 0xaab3b0,
};
export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size = 12,
  color = "#40524f",
) {
  return scene.add
    .text(x, y, value, {
      fontFamily: "Arial, sans-serif",
      fontSize: size,
      color,
      align: "center",
      letterSpacing: 1,
    })
    .setOrigin(0.5);
}
/** Original reusable architectural objects. Bounds also feed physical collision. */
function object(g: Phaser.GameObjects.Graphics, o: MapObject) {
  const { x, y, width: w, height: h } = o;
  const box = (color: number) =>
    g.fillStyle(color).fillRoundedRect(x, y, w, h, 3);
  if (o.kind === "lightwell") {
    box(0x899b8f);
    g.fillStyle(0x708577).fillRect(x + 5, y + 5, w - 10, h - 10);
    g.lineStyle(2, 0xc4cabe).strokeRect(x + 3, y + 3, w - 6, h - 6);
    return;
  }
  if (o.kind === "auditorium" || o.kind === "gallery") {
    box(0xb7aa95);
    const centerX = x + w * 0.08,
      centerY = y + h / 2;
    g.fillStyle(0x8b7761).fillRoundedRect(
      x + 5,
      y + h * 0.27,
      w * 0.14,
      h * 0.46,
      6,
    );
    // Fan-shaped seating follows the west-facing stage in the supplied plans.
    for (let row = 0; row < 8; row++) {
      const rx = w * (0.28 + row * 0.085),
        ry = h * (0.2 + row * 0.035);
      for (let seat = 0; seat < 15; seat++) {
        if (seat === 7) continue;
        const angle = -1.13 + (seat / 14) * 2.26;
        g.fillStyle(row % 2 ? 0x607c77 : 0x708982).fillRoundedRect(
          centerX + Math.cos(angle) * rx,
          centerY + Math.sin(angle) * ry,
          6,
          5,
          1,
        );
      }
    }
    return;
  }
  if (o.kind === "tree") {
    g.fillStyle(0x314740, 0.14).fillEllipse(
      x + w / 2 + 9,
      y + h / 2 + 12,
      w + 15,
      h + 10,
    );
    box(0xa9ac95);
    g.fillStyle(0x5d7862).fillCircle(x + w / 2, y + h / 2, w * 0.54);
    g.fillStyle(0x789379).fillCircle(x + w * 0.38, y + h * 0.34, w * 0.32);
    return;
  }
  if (o.kind === "stairs") {
    box(0xa7b0a8);
    g.lineStyle(2, 0xe8e9df);
    for (let n = 6; n < h; n += 7)
      g.lineBetween(x + 5, y + n, x + w - 5, y + n);
    g.lineStyle(3, 0x566962)
      .lineBetween(x, y, x, y + h)
      .lineBetween(x + w, y, x + w, y + h);
    return;
  }
  if (o.kind === "gate") {
    g.fillStyle(0x725948)
      .fillRect(x, y, 16, h + 10)
      .fillRect(x + w - 16, y, 16, h + 10);
    g.lineStyle(3, 0x4e6158)
      .lineBetween(x, y, x + 45, y)
      .lineBetween(x + w - 45, y, x + w, y);
    return;
  }
  if (o.kind === "scanner") {
    box(0x738986);
    g.fillStyle(0x334744).fillRect(x + 6, y + 10, w - 12, h - 20);
    g.fillStyle(0xbcc7bf).fillRect(x + 12, y + 22, w - 24, h - 44);
    g.fillStyle(0x65b2aa).fillRect(x + w - 10, y + 4, 5, 7);
    g.lineStyle(2, 0xd6dfd6).strokeRect(x, y, w, h);
    return;
  }
  if (o.kind === "punch") {
    box(0x849c99);
    g.fillStyle(0xd3ded8).fillRect(x + 4, y + 4, w - 8, h - 8);
    g.fillStyle(0x478b80).fillCircle(x + w / 2, y + 10, 3);
    g.lineStyle(2, 0xa1bab6).lineBetween(
      x + w / 2,
      y + h / 2,
      x + w + 12,
      y + h / 2,
    );
    return;
  }
  if (o.kind === "lift") {
    box(0x4c615f);
    g.fillStyle(0xbccbc6).fillRect(x + 4, y + 4, w - 8, h - 8);
    g.lineStyle(1, 0x637b75).lineBetween(
      x + w / 2,
      y + 4,
      x + w / 2,
      y + h - 4,
    );
    g.fillStyle(0x81b8a9).fillRect(x + w + 3, y + 8, 4, 8);
    return;
  }
  if (o.kind === "door") {
    g.fillStyle(0x978267).fillRect(x, y, w, h);
    g.lineStyle(1, 0x9ca899, 0.7).lineBetween(x, y, x + 10, y - 32);
    return;
  }
  if (o.kind === "glass") {
    g.fillStyle(0x9dbdb7, 0.4).fillRect(x, y, w, h);
    g.lineStyle(2, 0x779c96).strokeRect(x, y, w, h);
    return;
  }
  g.fillStyle(0x3c4e47, 0.13).fillRoundedRect(x + 3, y + 5, w, h, 3);
  box(
    o.kind === "pillar"
      ? 0xc3c8b9
      : o.kind === "chair"
        ? 0x758b80
        : o.kind === "notice"
          ? 0x647b70
          : 0xb5a083,
  );
  g.fillStyle(
    o.kind === "pillar" ? 0xebe9db : o.kind === "chair" ? 0x9eafa0 : 0xd7c5a5,
  ).fillRoundedRect(x + 3, y + 3, w - 6, h - 7, 2);
  if (o.kind === "shelf") {
    for (let i = 7; i < w - 5; i += 5)
      g.fillStyle([0x6b8983, 0x9b6f5b, 0xb69f69][i % 3]).fillRect(
        x + i,
        y + 5,
        3,
        h - 13,
      );
  } else if (o.kind === "bench") {
    g.lineStyle(2, 0x8b785f).lineBetween(
      x + 4,
      y + h / 2,
      x + w - 4,
      y + h / 2,
    );
  } else if (o.kind === "notice") {
    g.fillStyle(0xe7dec4).fillRect(x + 8, y + 9, w - 16, h * 0.4);
  } else if (o.kind === "desk") {
    g.fillStyle(0x647c78).fillRect(x + 7, y + 6, 16, 10);
  }
}
export function drawFloor(scene: Phaser.Scene, floorId: string) {
  const floor = floorById(floorId)!;
  const g = scene.add.graphics().setDepth(0);
  g.fillStyle(0x9baa9f).fillRect(0, 0, WORLD.width, WORLD.height);
  // Lower building silhouettes remain visible under inaccessible roofs.
  for (const b of buildings) {
    const r = b.bounds;
    g.fillStyle(0x5a6d62, 0.12).fillRect(r.x + 15, r.y + 20, r.width, r.height);
    g.fillStyle(0xa5aea0).fillRect(r.x, r.y, r.width, r.height);
    if (!floor.areas.some((a) => a.buildingId === b.id)) {
      g.lineStyle(1, 0x8e9c8e, 0.35).strokeRect(
        r.x + 12,
        r.y + 12,
        r.width - 24,
        r.height - 24,
      );
    }
  }
  for (const a of [...floor.areas].sort(
    (a, b) =>
      Number(b.id === "parking-plate") - Number(a.id === "parking-plate"),
  )) {
    g.fillStyle(P[a.material]).fillRect(a.x, a.y, a.width, a.height);
    g.lineStyle(1, 0x6a7a6c, a.material === "outdoor" ? 0.13 : 0.08);
    const step = a.material === "parking" ? 80 : 40;
    for (let x = a.x + step; x < a.x + a.width; x += step)
      g.lineBetween(x, a.y, x, a.y + a.height);
    for (let y = a.y + step; y < a.y + a.height; y += step)
      g.lineBetween(a.x, y, a.x + a.width, y);
    g.lineStyle(2, 0xf6f4e7, 0.38).strokeRect(
      a.x + 3,
      a.y + 3,
      a.width - 6,
      a.height - 6,
    );
  }
  if (floor.order === 0) {
    // Courtyard paving and shaded colonnade frame an open, navigable centre.
    g.lineStyle(3, 0xe9e8d9).strokeRect(565, 520, 435, 190);
    g.lineStyle(1, 0xa1ad98).strokeRect(573, 528, 419, 174);
    for (let x = 520; x < 1050; x += 80)
      g.fillStyle(0x445846, 0.055).fillRect(x, 462, 20, 55);
    g.fillStyle(0x856e59).fillRoundedRect(1090, 1250, 65, 85, 3);
    text(scene, 1122, 1292, "ENTRY\nROOM", 9, "#f0e4cb");
  }
  const solids = collisionRects(floorId);
  // Draw only structural walls, not furniture collision boxes.
  const furniture = new Set(floor.objects.filter((o) => o.solid));
  for (const r of solids) {
    if (furniture.has(r as MapObject)) continue;
    g.fillStyle(0x344c42, 0.16).fillRect(r.x + 5, r.y + 7, r.width, r.height);
    g.fillStyle(P.wall).fillRect(r.x, r.y, r.width, r.height);
    g.fillStyle(P.cap).fillRect(
      r.x,
      r.y,
      Math.max(3, r.width - 2),
      Math.max(3, r.height - 3),
    );
  }
  // Glazed perimeter bands and door thresholds give rooms an architectural scale.
  for (const a of floor.areas.filter(
    (a) => a.buildingId && !a.id.includes("-walk") && a.width > 100,
  )) {
    for (let x = a.x + 24; x < a.x + a.width - 20; x += 50) {
      g.fillStyle(0x91b6b0, 0.75).fillRect(x, a.y + 5, 26, 4);
      g.fillStyle(0xe5efde, 0.7).fillRect(x, a.y + 5, 10, 2);
    }
  }
  for (const o of floor.objects) object(g, o);
  for (const c of connectionsOn(floorId)) {
    object(g, {
      kind: c.kind,
      x: c.position.x - 20,
      y: c.position.y - 18,
      width: 40,
      height: 36,
    });
    text(
      scene,
      c.position.x,
      c.position.y + 32,
      c.kind === "lift" ? "LIFT" : "STAIRS",
      9,
    );
  }
  for (const l of floor.labels)
    text(
      scene,
      l.x,
      l.y,
      l.text,
      l.text === "EWU COURTYARD" ? 22 : l.text.includes("BLOCK") ? 13 : 10,
    );
  const markers = new Map<string, Phaser.GameObjects.Text>();
  locations
    .filter((l) => l.floorId === floorId)
    .forEach((l) => {
      const { x, y } = l.worldPosition;
      scene.add
        .circle(x, y, 27, 0x477f77, 0.09)
        .setStrokeStyle(1, 0x638d7b, 0.45);
      scene.add.circle(x, y, 16, 0x2d5955).setStrokeStyle(2, 0xf2dfae);
      markers.set(l.id, text(scene, x, y, "◇", 18, "#ffedbd"));
      text(scene, x, y + 43, l.id === "gate" ? "BEGIN YOUR QUEST" : l.name, 11);
    });
  return markers;
}
