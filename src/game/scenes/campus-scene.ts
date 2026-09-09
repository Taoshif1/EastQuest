import * as Phaser from "phaser";
import { buildings, locations, quests, WORLD } from "@/game/data/campus";
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
  private disposers: (() => void)[] = [];
  private markerLabels = new Map<string, Phaser.GameObjects.Text>();
  constructor(private session: GameSession) {
    super("campus");
  }
  create() {
    this.physics.world.setBounds(30, 30, WORLD.width - 60, WORLD.height - 60);
    this.drawCampus();
    this.createAvatar();
    const start = this.session.position.getPosition();
    this.player = this.physics.add
      .sprite(start.x, start.y, "explorer")
      .setDepth(20);
    this.player.setCollideWorldBounds(true).setSize(20, 18).setOffset(10, 27);
    const walls = this.physics.add.staticGroup();
    buildings.forEach((b) => {
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
    // Gate pillars block movement, while the central arch remains walkable.
    [535, 745].forEach((x) =>
      walls.add(this.add.rectangle(x, 905, 32, 60, 0x000000, 0)),
    );
    this.physics.add.collider(this.player, walls);
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,E",
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.cameras.main
      .setBounds(0, 0, WORLD.width, WORLD.height)
      .startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBackgroundColor("#152c29");
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
    // A Scene can be recreated by routing or development Strict Mode. Clean everything.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.disposers.forEach((fn) => fn());
      this.disposers = [];
      this.session.bridge.emit("INTERACTION_CLEARED", undefined);
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
    const g = this.add.graphics();
    g.fillStyle(0x244335).fillRoundedRect(28, 28, 1224, 1004, 22);
    g.lineStyle(5, 0x718274).strokeRoundedRect(28, 28, 1224, 1004, 22);
    // Deterministic decorative tufts keep the map lightweight and reproducible.
    for (let i = 0; i < 650; i++) {
      const x = 45 + ((i * 179) % 1190);
      const y = 45 + ((i * 137) % 965);
      g.fillStyle(i % 2 ? 0x365241 : 0x2c4b39).fillRect(x, y, 3, 4);
    }
    g.fillStyle(0x829183)
      .fillRect(592, 100, 96, 870)
      .fillRect(150, 290, 980, 80)
      .fillRect(150, 615, 980, 80);
    g.fillStyle(0xa3aa92)
      .fillRect(608, 105, 64, 865)
      .fillRect(155, 306, 970, 48)
      .fillRect(155, 631, 970, 48);
    g.lineStyle(1, 0x788b7c, 0.6);
    for (let y = 110; y < 975; y += 24) g.lineBetween(610, y, 670, y);
    for (let x = 160; x < 1130; x += 24) {
      g.lineBetween(x, 308, x, 352);
      g.lineBetween(x, 633, x, 677);
    }
    // Courtyard islands leave a clear north/south walking route through the center.
    [470, 810].forEach((x) => {
      g.fillStyle(0x162f2b).fillEllipse(x, 435, 125, 100);
      g.lineStyle(3, 0x82988b).strokeEllipse(x, 429, 120, 94);
      g.fillStyle(0x427574).fillEllipse(x, 427, 104, 78);
      g.lineStyle(2, 0x76a6a0).strokeEllipse(x, 427, 70, 45);
      g.fillStyle(0xacc4ae).fillCircle(x, 425, 8);
    });
    buildings.forEach((b) => {
      g.fillStyle(0x122b26, 0.65).fillRoundedRect(
        b.x + 12,
        b.y + 14,
        b.width,
        b.height,
        4,
      );
      g.fillStyle(b.color).fillRect(b.x, b.y, b.width, b.height);
      g.fillStyle(0x364e46).fillRect(
        b.x + 8,
        b.y + 8,
        b.width - 16,
        b.height - 32,
      );
      g.fillStyle(0x435e53).fillRect(b.x + 16, b.y + 16, b.width - 32, 42);
      for (let i = 0; i < 6; i++) {
        g.fillStyle(0xa4c3b1).fillRect(b.x + 20 + i * 35, b.y + 67, 23, 24);
        g.fillStyle(0x72998b).fillRect(b.x + 22 + i * 35, b.y + 69, 8, 20);
      }
      g.fillStyle(0x152e2b).fillRect(
        b.x + b.width / 2 - 18,
        b.y + b.height - 26,
        36,
        26,
      );
      g.fillStyle(0xc9c4a6).fillRect(
        b.x + b.width / 2 - 28,
        b.y + b.height,
        56,
        8,
      );
      this.label(b.x + b.width / 2, b.y + 37, b.label, 12);
      g.fillStyle(0xa5ada0).fillRect(b.x + 24, b.y + 18, 22, 9);
    });
    const tree = (x: number, y: number) => {
      g.fillStyle(0x102e26, 0.6).fillEllipse(x + 8, y + 12, 44, 27);
      g.fillStyle(0x8b7351).fillRect(x - 4, y, 8, 21);
      g.fillStyle(0x315b40).fillCircle(x, y - 5, 24);
      g.fillStyle(0x477956).fillCircle(x - 7, y - 12, 18);
      g.fillStyle(0x5c8a60).fillCircle(x - 10, y - 18, 10);
    };
    for (let x = 90; x < 1200; x += 85) {
      tree(x, 82);
      if (x < 500 || x > 780) tree(x, 958);
    }
    for (let y = 175; y < 900; y += 105) {
      tree(93, y);
      tree(1187, y);
    }
    [
      [230, 775],
      [340, 820],
      [440, 755],
      [850, 775],
      [1030, 820],
      [750, 160],
      [535, 160],
      [160, 440],
      [1110, 445],
    ].forEach(([x, y]) => tree(x, y));
    [390, 730].forEach((y) =>
      [570, 710].forEach((x) => {
        g.fillStyle(0x172d29).fillRect(x - 2, y, 4, 30);
        g.fillStyle(0xebcc88).fillCircle(x, y - 2, 5);
        g.fillStyle(0xeccc88, 0.06).fillCircle(x, y - 2, 20);
      }),
    );
    [
      [470, 725],
      [775, 725],
      [470, 365],
      [775, 365],
    ].forEach(([x, y]) => {
      g.fillStyle(0x172c25).fillRect(x, y + 8, 44, 10);
      g.fillStyle(0x9f8d66)
        .fillRect(x, y, 44, 6)
        .fillRect(x, y + 8, 44, 6);
    });
    g.fillStyle(0x233f37).fillRoundedRect(520, 760, 240, 44, 5);
    this.label(640, 782, "E W U  /  EASTQUEST", 15, "#d5c69c");
    [519, 729].forEach((x) => {
      g.fillStyle(0xa7aa91).fillRect(x, 875, 32, 60);
      g.fillStyle(0xd9bd80).fillRect(x - 4, 870, 40, 10);
    });
    g.fillStyle(0x334b40).fillRect(515, 855, 254, 24);
    this.label(640, 867, "EAST WEST UNIVERSITY", 13, "#f2d294");
    this.label(640, 993, "MAIN GATE  /  YOUR FIRST CHAPTER", 13, "#d1caa9");
    locations.forEach((l, index) => {
      const { x, y } = l.worldPosition;
      this.add
        .circle(x, y, 29, 0xf1bc61, 0.08)
        .setStrokeStyle(1, 0xe9bd70, 0.35);
      this.add.circle(x, y, 17, 0x182f2c).setStrokeStyle(2, 0xf1bd67);
      this.markerLabels.set(
        l.id,
        this.label(x, y, index === 0 ? "!" : String(index + 1), 17, "#f8d08b"),
      );
      if (index > 0) this.label(x, y + 42, l.name.toUpperCase(), 11, "#e3dfc1");
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
    const direction = this.paused
      ? { x: 0, y: 0 }
      : normalizedDirection(
          Number(down("D") || down("RIGHT")) -
            Number(down("A") || down("LEFT")) +
            this.touch.x,
          Number(down("S") || down("DOWN")) -
            Number(down("W") || down("UP")) +
            this.touch.y,
        );
    this.player.setVelocity(
      direction.x * WORLD.speed,
      direction.y * WORLD.speed,
    );
    if (direction.x) this.player.setFlipX(direction.x < 0);
    const position = { x: this.player.x, y: this.player.y };
    this.session.position.update(position);
    this.session.bridge.emit("PLAYER_POSITION_CHANGED", position);
    const location = locations.find(
      (l) =>
        Math.hypot(
          position.x - l.worldPosition.x,
          position.y - l.worldPosition.y,
        ) <= l.interactionRadius,
    );
    if ((location?.id ?? null) !== this.nearby) {
      this.nearby = location?.id ?? null;
      if (location)
        this.session.bridge.emit("INTERACTION_AVAILABLE", location.id);
      else this.session.bridge.emit("INTERACTION_CLEARED", undefined);
    }
    if (!this.paused && Phaser.Input.Keyboard.JustDown(this.keys.E))
      this.session.bridge.emit("INTERACT", undefined);
  }
}
