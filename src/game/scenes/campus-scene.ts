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
import { normalizedDirection } from "@/game/movement/position-provider";
import type { WorldPosition } from "@/types/game";

/** Scene owns drawing, Arcade physics and proximity prompts, never quest rewards. */
export class CampusScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private touch: WorldPosition = { x: 0, y: 0 };
  private paused = false;
  private nearby: string | null = null;
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
    this.nearestConnection = null;
    this.travelling = false;
    const floorId = this.session.position.getWorldLocation().floorId;
    this.physics.world.setBounds(30, 30, WORLD.width - 60, WORLD.height - 60);
    this.drawCampus();
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
    if (direction.y) this.player.setAngle(direction.y < 0 ? 180 : 0);
    this.player.setScale(this.moving ? 1 + Math.sin(this.time.now / 90) * 0.025 : 1);
    const position = { x: this.player.x, y: this.player.y };
    const floorId = this.session.position.getWorldLocation().floorId;
    this.session.position.updateWorldLocation({
      floorId,
      buildingId: zoneAt(floorId, position)?.buildingId ?? null,
      position,
    });
    this.session.bridge.emit("PLAYER_POSITION_CHANGED", position);
    const location = locations.find(
      (l) =>
        l.floorId === floorId &&
        Math.hypot(
          position.x - l.worldPosition.x,
          position.y - l.worldPosition.y,
        ) <= l.interactionRadius,
    );
    if ((location?.id ?? null) !== this.nearby) {
      this.nearby = location?.id ?? null;
      if (location) {
        this.session.bridge.emit("INTERACTION_AVAILABLE", location.id);
        this.session.bridge.emit("POI_DISCOVERED", location.id);
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
