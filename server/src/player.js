const Entity = require("./entity");

class Player extends Entity {
  constructor(x, y, z, socket) {
    super(x, y, z);
    this.socket = socket;
  }
  receivedMessage(origin, type, message) {
    this.socket.emit(type, { ...message, from: origin.id });
  }
}

module.exports = Player;
