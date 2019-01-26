const { C } = require("./constants");
const Entity = require("./entity");
const Spaceship = require("./spaceship");
const { add, random } = require("./vector-utils");

class Planet extends Entity {
  constructor(pos) {
    super(pos);
    this.owner = null;
    this.productionSpeed = 0;
    this.capacity = 0;
  }

  takeOver(owner) {
    this.owner = owner;
    this.broadcast("take-over", {
      owner: owner ? owner.id : null,
      position: this.position
    });
  }

  receivedMessage(origin, type, message) {
    super.receivedMessage(origin, type, message);
    switch (type) {
      case "ping":
        origin.sendMessage(this, "pong", {});
        return;
      case "transfer": {
        const { source, destination } = message;
        if (true || (origin === source.owner && this.capacity > 1)) {
          const spaceship = new Spaceship(
            add(this.position, random(0.1 * C)),
            origin
          );
          this.universe.addEntity(spaceship);
          this.capacity -= 1;
          spaceship.updateDestination(destination);
        }
      }
    }
  }

  update(dt) {
    if (this.owner) {
      this.capacity += this.productionSpeed * dt;
    }
  }

  receiveSpaceship(ship) {
    if (!this.owner) {
      this.takeOver(ship.owner);
      this.capacity += 1;
    } else if (this.owner === ship.owner) {
      this.capacity += 1;
    } else {
      this.capacity -= 1;
      ship.kill();
      if (this.capacity === 0) {
        this.takeOver(null);
      }
    }
  }
}

module.exports = Planet;
