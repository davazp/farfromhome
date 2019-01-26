const uuidv1 = require("uuid/v1");
const V = require("./vector-utils");
const { C } = require("./constants");

class Entity {
  constructor(pos) {
    this.id = uuidv1();
    this.universe = null;
    this.position = pos;
    this.messageQueue = [];
  }

  update(_dt) {}

  tick(dt) {
    this.update(dt);
    const messages = this.messageQueue;
    this.messageQueue = [];
    messages.forEach(m => {
      m.reach += dt * C;
      const d = V.distance(this.position, m.sourcePosition);
      if (d <= m.reach) {
        this.receivedMessage(m.source, m.type, m.message);
      } else {
        this.messageQueue.push(m);
      }
    });
  }

  receivedMessage(source, type, message) {
    // console.log({ type: "received", origin, message });
  }

  sendMessage(source, type, message) {
    this.messageQueue.push({
      type,
      reach: 0,
      sourcePosition: source.position,
      source,
      message
    });
  }

  broadcast(type, message) {
    this.universe.broadcast(this, type, message);
  }
}

module.exports = Entity;
