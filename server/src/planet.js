const Entity = require("./entity");

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
