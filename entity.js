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

class Planet extends Entity {
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

class Spaceship extends Entity {
  constructor(x, y, z) {
    super(x, y, z);
    this.velocity = [0, 0, 0];
  }
  update(dt) {
    const [x, y, z] = this.pos;
    const [vx, vy, vz] = this.velocity;
    this.pos = [x + dt * vx, y + dt * vy, z + dt * vz];
  }
}

class Universe {
  constructor() {
    this.entities = [];
    for (let i = 0; i < 3; i++) {
      this.entities.push(
        new Planet(
          Λ * (2 * Math.random() - 1),
          Λ * (2 * Math.random() - 1),
          Λ * (2 * Math.random() - 1)
        )
      );
    }
    this.player = new Player(0, 0, 0);
  }

  broadcast(message) {
    this.entities.forEach(e => {
      e.sendMessage(this.player, message);
    });
  }
}
