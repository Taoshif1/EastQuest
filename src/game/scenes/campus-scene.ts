import * as Phaser from "phaser";
import {
  blueprintBounds,
  defaultCalibration,
} from "@/game/data/campus/calibration";
import { locations, quests, WORLD } from "@/game/data/campus";
import {
  collisionRects,
  connections,
  connectionsOn,
  destinations,
  zoneAt,
} from "@/game/data/campus/index";
import { drawFloor } from "@/game/rendering/campus-renderer";
import type { GameSession } from "@/game/core/session";
import { facingDirection, normalizedDirection } from "@/game/movement/position-provider";
import type { WorldPosition } from "@/types/game";
import {
  npcs,
  rankInteractions,
  worldInteractions,
  type InteractionCandidate,
} from "@/game/campus-life";

/** Scene owns drawing, Arcade physics and proximity prompts, never quest rewards. */
export class CampusScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private touch: WorldPosition = { x: 0, y: 0 };
  private paused = false;
  private nearby: string | null = null;
  private nearbyCandidates: InteractionCandidate[] = [];
  private nearestConnection: string | null = null;
  private travelling = false;
  private moving = false;
  private disposers: (() => void)[] = [];
  private markerLabels = new Map<string, Phaser.GameObjects.Text>();
  constructor(private session: GameSession) {
    super("campus");
  }
  create() {
    this.nearby = null;
    this.nearbyCandidates = [];
    this.nearestConnection = null;
    this.travelling = false;
    const floorId = this.session.position.getWorldLocation().floorId;
    this.physics.world.setBounds(30, 30, WORLD.width - 60, WORLD.height - 60);
    this.drawCampus();
    this.drawCampusLife(floorId);
    this.createAvatar();
    const start = this.session.position.getPosition();
    this.player = this.physics.add
      .sprite(start.x, start.y, "explorer")
      .setDepth(20);
    this.player.setCollideWorldBounds(true).setSize(18, 18).setOffset(11, 16);
    const walls = this.physics.add.staticGroup();
    collisionRects(floorId).forEach((b) => {
      const wall = this.add.rectangle(
        b.x + b.width / 2,
        b.y + b.height / 2,
        b.width,
        b.height,
        0x000000,
        0,
      );
      walls.add(wall);
    });

    this.physics.add.collider(this.player, walls);
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,E,M",
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.cameras.main
      .setBounds(0, 0, WORLD.width, WORLD.height)
      .startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBackgroundColor("#9baa9f");
    this.cameras.main.setZoom(this.scale.width < 600 ? 0.85 : 1);
    this.cameras.main.fadeIn(180, 35, 50, 45);
    this.session.bridge.emit("FLOOR_CHANGED", floorId);
    const resetInput = () => {
      this.touch = { x: 0, y: 0 };
      this.input.keyboard?.resetKeys();
      this.player.setVelocity(0);
    };
    window.addEventListener("blur", resetInput);
    this.disposers.push(() => window.removeEventListener("blur", resetInput));
    this.disposers.push(
      this.session.bridge.on("INPUT_CHANGED", (input) => {
        this.touch = input;
      }),
    );
    this.disposers.push(
      this.session.bridge.on("PAUSE_CHANGED", (paused) => {
        this.paused = paused;
        resetInput();
        if (this.input.keyboard) this.input.keyboard.enabled = !paused;
      }),
    );
    this.disposers.push(
      this.session.bridge.on("CYCLE_INTERACTION", (direction) => {
        if (this.nearbyCandidates.length < 2) return;
        const current = this.nearbyCandidates.findIndex(
          (candidate) => candidate.id === this.nearby,
        );
        const next =
          (current + direction + this.nearbyCandidates.length) %
          this.nearbyCandidates.length;
        this.nearby = this.nearbyCandidates[next].id;
        this.session.bridge.emit("INTERACTION_AVAILABLE", this.nearby);
      }),
    );
    this.disposers.push(
      this.session.bridge.on("PROGRESS_UPDATED", (ids) => {
        quests.forEach((quest) => {
          if (ids.includes(quest.collectibleId))
            this.markerLabels
              .get(quest.locationId)
              ?.setText("\u2713")
              .setColor("#a9e1bd");
        });
      }),
    );
    this.disposers.push(
      this.session.bridge.on("TRAVEL_REQUESTED", (request) => {
        const c = connections.find((c) => c.id === request.connectionId);
        if (
          !c ||
          this.travelling ||
          !destinations(c, floorId).includes(request.floorId as never)
        )
          return;
        if (
          Math.hypot(
            this.player.x - c.position.x,
            this.player.y - c.position.y,
          ) > 55
        )
          return;
        this.travelling = true;
        resetInput();
        this.cameras.main.fadeOut(180, 35, 50, 45);
        this.time.delayedCall(180, () => {
          this.session.position.updateWorldLocation({
            buildingId: c.buildingId,
            floorId: request.floorId as typeof floorId,
            position: c.position,
          });
          this.scene.restart();
        });
      }),
    );
    const overlay = this.add.graphics().setDepth(30).setVisible(false);
    collisionRects(floorId).forEach((r) =>
      overlay
        .lineStyle(1, 0xd7544a, 0.8)
        .strokeRect(r.x, r.y, r.width, r.height),
    );
    let calibration = defaultCalibration;
    const blueprints = new Map<string, Phaser.GameObjects.Image>();
    const loading = new Set<string>();
    const applyBlueprint = () => {
      for (const image of blueprints.values()) image.setVisible(false);
      if (!calibration.blueprint) return;
      const variant =
        calibration.color && floorId !== "roof-deck" ? "color" : "mono";
      const key = "blueprint-" + floorId + "-" + variant;
      const existing = blueprints.get(key);
      if (existing) {
        const bounds = blueprintBounds(floorId, variant === "color");
        existing
          .setPosition(
            bounds.x + calibration.offsetX,
            bounds.y + calibration.offsetY,
          )
          .setDisplaySize(
            bounds.width * calibration.scale,
            bounds.height * calibration.scale,
          )
          .setAlpha(calibration.opacity)
          .setVisible(true);
      } else if (!loading.has(key)) {
        loading.add(key);
        const show = () => {
          loading.delete(key);
          if (!this.scene.isActive() || !this.textures.exists(key)) return;
          blueprints.set(
            key,
            this.add.image(0, 0, key).setOrigin(0).setDepth(29),
          );
          applyBlueprint();
        };
        if (this.textures.exists(key)) show();
        else {
          this.load.image(
            key,
            "/api/campus-reference/" + floorId + "?variant=" + variant,
          );
          this.load.once("complete", show);
          this.load.start();
        }
      }
    };
    this.disposers.push(
      this.session.bridge.on("CALIBRATION_CHANGED", (options) => {
        if (new URLSearchParams(window.location.search).get("debug") !== "1")
          return;
        overlay.setVisible(options.collisions);
        if (process.env.NODE_ENV !== "development") return;
        calibration = options;
        applyBlueprint();
      }),
    );
    // A Scene can be recreated by routing or development Strict Mode. Clean everything.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.disposers.forEach((fn) => fn());
      this.disposers = [];
      this.session.bridge.emit("INTERACTION_CLEARED", undefined);
      this.session.bridge.emit("CONNECTION_AVAILABLE", null);
      for (const variant of ["mono", "color"]) {
        const key = "blueprint-" + floorId + "-" + variant;
        if (this.textures.exists(key)) this.textures.remove(key);
      }
    });
  }
  private label(
    x: number,
    y: number,
    text: string,
    size = 13,
    color = "#e5e7cf",
  ) {
    return this.add
      .text(x, y, text, {
        fontFamily: "Arial, sans-serif",
        fontSize: `${size}px`,
        color,
        align: "center",
        fontStyle: "bold",
        letterSpacing: 1,
      })
      .setOrigin(0.5);
  }
  private drawCampus() {
    this.markerLabels = drawFloor(
      this,
      this.session.position.getWorldLocation().floorId,
    );
  }
  private drawCampusLife(floorId: string) {
    worldInteractions
      .filter((item) => item.floorId === floorId)
      .forEach((item) => {
        const color = item.kind === "discovery" ? 0xf1bd6c : 0x86c5ca;
        this.add
          .circle(item.position.x, item.position.y, 12, color, 0.75)
          .setStrokeStyle(2, 0xf6f4e7, 0.85)
          .setDepth(8);
        this.label(item.position.x, item.position.y - 24, item.kind === "discovery" ? "✦" : "•", 14, "#fff0c4").setDepth(8);
      });
    npcs
      .filter((npc) => npc.floorId === floorId)
      .forEach((npc) => {
        const group = this.add.container(npc.position.x, npc.position.y).setDepth(9);
        const accent = Phaser.Display.Color.HexStringToColor(npc.accent).color;
        const height = npc.id === "sana" || npc.id === "javed" ? 1.08 : npc.id === "toma" ? 0.92 : 1;
        const body = this.add
          .rectangle(0, 8, 20, 24, accent, 1)
          .setStrokeStyle(2, 0x182631, 1);
        const head = this.add.circle(0, -10, 9, 0xe8ba92, 1);
        const hair = this.add.circle(0, -17, npc.id === "rafi" ? 8 : 7, 0x263640, 1);
        group.add([body, head, hair]);
        if (npc.id === "rafi") {
          group.add(this.add.rectangle(-13, 7, 5, 18, 0x5e4735, 1).setAngle(-12));
        } else if (npc.id === "lina") {
          group.add(this.add.rectangle(13, 9, 7, 13, 0xe7d8a0, 1));
        } else if (npc.id === "toma") {
          group.add(this.add.circle(8, -11, 2, 0x9ad3d2, 1));
        } else if (npc.id === "javed") {
          group.add(this.add.rectangle(0, -21, 18, 4, accent, 1));
        }
        group.setScale(height);
        this.tweens.add({
          targets: group,
          y: npc.position.y - 2,
          duration: 850 + npc.id.length * 60,
          yoyo: true,
          repeat: -1,
          ease: "Sine.inOut",
        });
        this.label(npc.position.x, npc.position.y - 27, npc.name, 11, npc.accent).setDepth(9);
      });
  }
  private createAvatar() {
    if (this.textures.exists("explorer")) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x0c211f, 0.5).fillEllipse(20, 43, 29, 10);
    g.fillStyle(0x172b38)
      .fillRoundedRect(10, 29, 8, 14, 2)
      .fillRoundedRect(23, 29, 8, 14, 2);
    g.fillStyle(0xf0b65b).fillRoundedRect(8, 18, 26, 17, 5);
    g.fillStyle(0x3c737a).fillRoundedRect(22, 21, 12, 14, 3);
    g.fillStyle(0xe8ba92).fillCircle(20, 13, 9);
    g.fillStyle(0x25323e)
      .fillRoundedRect(10, 3, 21, 9, 3)
      .fillRect(9, 10, 7, 7);
    g.fillStyle(0x25323e).fillCircle(24, 14, 1.5);
    g.generateTexture("explorer", 40, 50);
    g.destroy();
  }
  update() {
    if (!this.player || !this.keys) return;
    const down = (key: string) => this.keys[key].isDown;
    const direction =
      this.paused || this.travelling
        ? { x: 0, y: 0 }
        : normalizedDirection(
            Number(down("D") || down("RIGHT")) -
              Number(down("A") || down("LEFT")) +
              this.touch.x,
            Number(down("S") || down("DOWN")) -
              Number(down("W") || down("UP")) +
              this.touch.y,
          );
    this.moving = direction.x !== 0 || direction.y !== 0;
    const targetX = direction.x * WORLD.speed;
    const targetY = direction.y * WORLD.speed;
    const acceleration = 1800;
    const delta = acceleration * (this.game.loop.delta / 1000);
    const moveTowards = (current: number, target: number) =>
      Math.abs(target - current) <= delta
        ? target
        : current + Math.sign(target - current) * delta;
    this.player.setVelocity(
      moveTowards(this.player.body!.velocity.x, targetX),
      moveTowards(this.player.body!.velocity.y, targetY),
    );
    // A retiring scene must not overwrite the destination landing during restart.
    if (this.travelling) return;
    if (direction.x) this.player.setFlipX(direction.x < 0);
    // The procedural avatar has no rear-facing frame; keep its body upright rather
    // than rotating it upside down while still tracking the movement direction.
    this.player.setAngle(0);
    this.player.setData("facing", facingDirection(direction.x, direction.y));
    this.player.setScale(this.moving ? 1 + Math.sin(this.time.now / 90) * 0.025 : 1);
    const position = { x: this.player.x, y: this.player.y };
    const floorId = this.session.position.getWorldLocation().floorId;
    this.session.position.updateWorldLocation({
      floorId,
      buildingId: zoneAt(floorId, position)?.buildingId ?? null,
      position,
    });
    this.session.bridge.emit("PLAYER_POSITION_CHANGED", position);
    const candidates = [
      ...locations
        .filter((l) => l.floorId === floorId)
        .map((l) => ({
          id: l.id,
          distance: Math.hypot(position.x - l.worldPosition.x, position.y - l.worldPosition.y),
          radius: l.interactionRadius,
          kind: "poi" as const,
        })),
      ...worldInteractions
        .filter((item) => item.floorId === floorId)
        .map((item) => ({
          id: item.id,
          distance: Math.hypot(position.x - item.position.x, position.y - item.position.y),
          radius: item.radius ?? 58,
          kind:
            item.kind === "discovery"
              ? ("discovery" as const)
              : item.kind === "quest"
                ? ("side-quest" as const)
                : ("activity" as const),
        })),
      ...npcs
        .filter((npc) => npc.floorId === floorId)
        .map((npc) => ({
          id: `npc:${npc.id}`,
          distance: Math.hypot(position.x - npc.position.x, position.y - npc.position.y),
          radius: 58,
          kind: "npc" as const,
        })),
    ]
      .filter((candidate) => candidate.distance <= candidate.radius)
      .map((candidate) => ({
        id: candidate.id,
        distance: candidate.distance,
        kind: candidate.kind,
      }));
    this.nearbyCandidates = rankInteractions(candidates);
    const preferred = this.nearbyCandidates.find(
      (candidate) => candidate.id === this.nearby,
    );
    const selected = preferred ?? this.nearbyCandidates[0];
    const interactionId = selected?.id ?? null;
    if (interactionId !== this.nearby) {
      this.nearby = interactionId;
      if (selected && interactionId) {
        this.session.bridge.emit("INTERACTION_AVAILABLE", interactionId);
        this.session.bridge.emit(
          "INTERACTION_OPTIONS",
          this.nearbyCandidates.map((candidate) => candidate.id),
        );
        if (selected.kind === "poi")
          this.session.bridge.emit("POI_DISCOVERED", interactionId);
      } else this.session.bridge.emit("INTERACTION_CLEARED", undefined);
    }
    const core = connectionsOn(floorId)
      .map((c) => ({
        c,
        d: Math.hypot(position.x - c.position.x, position.y - c.position.y),
      }))
      .sort((a, b) => a.d - b.d)[0];
    const coreId = core && core.d <= 50 ? core.c.id : null;
    if (coreId !== this.nearestConnection) {
      this.nearestConnection = coreId;
      this.session.bridge.emit("CONNECTION_AVAILABLE", coreId);
    }

    if (
      !this.paused &&
      !this.travelling &&
      Phaser.Input.Keyboard.JustDown(this.keys.E)
    )
      this.session.bridge.emit("INTERACT", undefined);
  }
}
