const { Λ, C } = require("./constants");

const Player = require("./player");
const Planet = require("./planet");
const Spaceship = require("./spaceship");

class Universe {
  constructor(io) {
    this.entities = [];

    this.player = new Player(0, 0, 0, io);
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

  broadcast(source, type, message) {
    this.entities.forEach(e => {
      if (e !== source) {
        e.sendMessage(source, type, message);
      }
    });
  }
}

module.exports = Universe;
