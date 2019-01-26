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
    this.universe = null;
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
    // console.log({ type: "received", origin, message });
  }

  sendMessage(source, message) {
    this.messageQueue.push({
      reach: 0,
      sourcePosition: source.position,
      source,
      message
    });
  }

  broadcast(message) {
    this.universe.broadcast(this, message);
  }
}

class Planet extends Entity {
  constructor(x, y, z) {
    super(x, y, z);
    this.owner = null;
    this.productionSpeed = 0;
    this.capacity = 0;
  }

  receivedMessage(origin, message) {
    super.receivedMessage(origin, message);
    switch (message.type) {
      case "ping":
        origin.sendMessage(this, { type: "pong" });
        return;
    }
  }

  update(dt) {
    if (this.owner) {
      this.capacity += this.productionSpeed * dt;
    }
  }

  receiveSpaceship(ship) {
    if (!this.owner) {
      this.owner = ship.owner;
      this.capacity += 1;
    } else if (this.owner === ship.owner) {
      this.capacity += 1;
    } else {
      this.capacity -= 1;
      ship.kill();
      if (this.capacity === 0) {
        this.owner = null;
      }
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
    this.owner = owner;
    this.heartbeat = setInterval(() => {
      owner.sendMessage(this, { type: "heartbeat", position: this.position });
    }, 1000);
  }

  kill() {
    clearInterval(this.heartbeat);
    this.owner.sendMessage(this, { type: "sos", position: this.position });
    this.universe.removeEntity(this);
  }

  receivedMessage(origin, message) {
    switch (message.type) {
      case "goto": {
        this.updateDestination(message.target);
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
      this.destination.receiveSpaceship(this);
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
    this.entities = [];

    this.player = new Player(0, 0, 0);
    this.somePlanet = new Planet(Λ / 2, Λ / 2, Λ / 2);
    this.somePlanet.owner = "enemy";
    this.somePlanet.capacity = 99;

    for (let i = 0; i < 1000; i++) {
      this.addEntity(
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

      this.addEntity(s);
    }

    this.addEntity(this.player);
    this.addEntity(this.somePlanet);
  }

  addEntity(ent) {
    ent.universe = this;
    this.entities.push(ent);
  }

  removeEntity(ent) {
    ent.universe = null;
    this.entities = this.entities.filter(e => e !== ent);
  }

  tick(dt) {
    this.somePlanet.tick(dt);
    this.entities.forEach(e => e.tick(dt));
  }

  broadcast(source, message) {
    this.entities.forEach(e => {
      if (e !== source) {
        e.sendMessage(this.player, message);
      }
    });
  }
}

const universe = new Universe();

setInterval(() => {
  universe.tick(0.1);
}, 100);

setTimeout(() => {
  universe.player.broadcast({ type: "goto", target: universe.somePlanet });
}, 1000);

io.on("connection", function(socket) {
  socket.on("message", _message => {
    socket.emit("message", { type: "pong" });
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
