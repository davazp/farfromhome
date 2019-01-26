const Entity = require("./entity");

class Player extends Entity {
  constructor(pos, socket) {
    super(pos);
    this.socket = socket;
  }
  receivedMessage(origin, type, message) {
    this.socket.emit(type, { ...message, from: origin.id });
  }
}

module.exports = Player;
