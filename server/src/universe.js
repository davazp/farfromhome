const { Λ, C } = require("./constants");

const Player = require("./player");
const Planet = require("./planet");
const Spaceship = require("./spaceship");

class Universe {
  constructor() {
    this.entities = [];

    // this.player = new Player(0, 0, 0, io);
    // this.somePlanet = new Planet(Λ / 2, Λ / 2, Λ / 2);
    // this.somePlanet.owner = "enemy";
    // this.somePlanet.capacity = 99;

    // for (let i = 0; i < 1000; i++) {
    //   this.addEntity(
    //     new Planet(
    //       Λ * (2 * Math.random() - 1),
    //       Λ * (2 * Math.random() - 1),
    //       Λ * (2 * Math.random() - 1)
    //     )
    //   );
    // }

    // this.addEntity(this.player);
    // this.addEntity(this.somePlanet);
  }

  getEntityById(id) {
    return this.entities.find(e => e.id === id);
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
