const C = 299792458; /* m/s */

const Λ = 10 * C;

function distance(p1, p2) {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
  );
}

class Entity {
  constructor(x, y, z) {
    this.pos = [x, y, z];
  }
  receivedMessage(origin, message) {
    console.log({ pos: this.pos, origin, message });
  }

  sendMessage(source, message) {
    const d = distance(this.pos, source.pos);
    const SECOND = 1000;
    const delay = (d / C) * SECOND;
    setTimeout(() => {
      this.receivedMessage(source, message);
    }, delay);
  }
}

class Player extends Entity {}

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

class Universe {
  constructor() {
    this.home = new Entity([0, 10 * C, 0]);

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
      if (true || distance(e.pos, this.player.pos) < 5 * C) {
        e.sendMessage(this.player, { type: "ping" });
      }
    });
  }
}

const U = new Universe();

U.broadcast("hello world!");
