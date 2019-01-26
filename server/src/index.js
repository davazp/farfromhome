const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuidv1 = require("uuid/v1");

const C = 1;
const Λ = 10 * C;

function distance(p1, p2) {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
  );
}

function speed(v) {
  return distance(v, [0, 0, 0]);
}

function scale(v, x) {
  return [v[0] * x, v[1] * x, v[2] * x];
}

function difference(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function velocity(from, to, spd) {
  const dir = difference(to, from);
  return scale(dir, spd / speed(dir));
}

class Entity {
  constructor(x, y, z) {
    this.id = uuidv1();
    this.position = [x, y, z];
    this.messageQueue = [];
  }

  update(_dt) {}

  tick(dt) {
    this.update(dt);
    const messages = this.messageQueue;
    this.messageQueue = [];
    messages.forEach(m => {
      m.reach += dt * C;
      const d = distance(this.position, m.sourcePosition);
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
      sourcePosition: source.position,
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

class Player extends Entity {
  receivedMessage(origin, message) {
    io.emit("message", { ...message, from: origin.id });
  }
}

class Spaceship extends Entity {
  constructor(x, y, z, owner) {
    super(x, y, z);
    this.updateVelocity([0, 0, 0]);
    this.destination = null;
    this.maxSpeed = 0.5 * C;
    setInterval(() => {
      owner.sendMessage(this, { type: "heartbeat", position: this.position });
    }, 1000);
  }

  receivedMessage(origin, message) {
    switch (message.type) {
      case "return": {
        this.updateDestination(origin);
      }
    }
  }

  updateVelocity(newvel) {
    this.velocity = newvel;
  }
  updateDestination(dest) {
    this.destination = dest;
    this.updateVelocity(velocity(this.position, dest.position, this.maxSpeed));
  }
  update(dt) {
    if (
      this.destination &&
      distance(this.position, this.destination.position) <=
        dt * speed(this.velocity)
    ) {
      this.position = this.destination.position;
      this.updateVelocity([0, 0, 0]);
      this.destination = null;
    } else {
      const [x, y, z] = this.position;
      const [vx, vy, vz] = this.velocity;
      this.position = [x + dt * vx, y + dt * vy, z + dt * vz];
    }
  }
}

class Universe {
  constructor() {
    this.player = new Player(0, 0, 0);

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

    for (let i = 0; i < 100; i++) {
      const s = new Spaceship(
        Λ * (2 * Math.random() - 1),
        Λ * (2 * Math.random() - 1),
        Λ * (2 * Math.random() - 1),
        this.player
      );

      s.updateVelocity([
        (C * (Math.random() - 0.5)) / 10,
        (C * (Math.random() - 0.5)) / 10,
        (C * (Math.random() - 0.5)) / 10
      ]);

      this.entities.push(s);
    }
  }

  tick(dt) {
    this.player.tick(dt);
    this.entities.forEach(e => e.tick(dt));
  }

  broadcast(message) {
    this.entities.forEach(e => {
      e.sendMessage(this.player, message);
    });
  }
}

const universe = new Universe();

setInterval(() => {
  universe.tick(0.1);
}, 100);

setTimeout(() => {
  universe.broadcast({ type: "return" });
}, 10000);

io.on("connection", function(socket) {
  socket.on("message", _message => {
    socket.emit("message", { type: "pong" });
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
