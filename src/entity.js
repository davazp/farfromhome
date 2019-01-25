const C = 1;
const Λ = 10 * C;

function relativePos(origin, p) {
  return [p[0] - origin[0], p[1] - origin[1], p[2] - origin[2]];
}

function distance(p1, p2) {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
  );
}

class Entity {
  constructor(x, y, z) {
    this.pos = [x, y, z];
    this.messageQueue = [];
  }

  update(_dt) {}

  tick(dt) {
    this.update(dt);
    const messages = this.messageQueue;
    this.messageQueue = [];
    messages.forEach(m => {
      m.reach += dt * C;
      const d = distance(this.pos, m.sourcePosition);
      if (d <= m.reach) {
        this.receivedMessage(m.source, m.message);
      } else {
        this.messageQueue.push(m);
      }
    });
  }

  receivedMessage(origin, message) {
    console.log({ type: "received", origin, message });
  }

  sendMessage(source, message) {
    this.messageQueue.push({
      reach: 0,
      sourcePosition: source.pos,
      source,
      message
    });
  }
}

export class Planet extends Entity {
  receivedMessage(origin, message) {
    super.receivedMessage(origin, message);
    switch (message.type) {
      case "ping":
        origin.sendMessage(this, { type: "pong" });
        return;
    }
  }
}

class Player extends Entity {}

export class Spaceship extends Entity {
  constructor(x, y, z) {
    super(x, y, z);
    this.updateVelocity([0, 0, 0]);
  }
  updateVelocity(newvel) {
    this.velocity = newvel;
  }
  update(dt) {
    const [x, y, z] = this.pos;
    const [vx, vy, vz] = this.velocity;
    this.pos = [x + dt * vx, y + dt * vy, z + dt * vz];
  }
}

export class Universe {
  constructor() {
    this.entities = [];
    for (let i = 0; i < 1000; i++) {
      this.entities.push(
        new Planet(
          Λ * (2 * Math.random() - 1),
          Λ * (2 * Math.random() - 1),
          Λ * (2 * Math.random() - 1)
        )
      );
    }

    for (let i = 0; i < 3; i++) {
      const s = new Spaceship(
        Λ * (2 * Math.random() - 1),
        Λ * (2 * Math.random() - 1),
        Λ * (2 * Math.random() - 1)
      );

      s.updateVelocity([
        (C * Math.random()) / 1,
        (C * Math.random()) / 1,
        (C * Math.random()) / 1
      ]);

      this.entities.push(s);
    }

    this.player = new Player(0, 0, 0);
  }

  tick(dt) {
    this.entities.forEach(e => e.tick(dt));
  }

  broadcast(message) {
    this.entities.forEach(e => {
      e.sendMessage(this.player, message);
    });
  }
}
