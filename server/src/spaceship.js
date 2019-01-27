const V = require("./vector-utils");
const { C } = require("./constants");
const Entity = require("./entity");

class Spaceship extends Entity {
  constructor(pos, owner) {
    super(pos);
    this.updateVelocity([0, 0, 0]);
    this.destination = null;
    this.maxSpeed = 0.5 * C;
    this.owner = owner;
    this.heartbeat = setInterval(() => {
      owner.sendMessage(this, "heartbeat", { position: this.position });
    }, 10);
  }

  destroy(_isKilled) {
    clearInterval(this.heartbeat);
    this.owner.sendMessage(this, "sos", { position: this.position });
    this.universe.removeEntity(this);
  }

  receivedMessage(origin, type, message) {
    switch (type) {
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
    this.updateVelocity(
      V.velocity(this.position, dest.position, this.maxSpeed)
    );
  }
  update(dt) {
    if (
      this.destination &&
      V.distance(this.position, this.destination.position) <=
        dt * V.speed(this.velocity)
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

module.exports = Spaceship;
