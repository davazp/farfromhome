const C = 299792458; /* m/s */

function distance(p1, p2) {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
  );
}

class Entity {
  constructor(x, y, z) {
    this.pos = [x, y, z];
  }
  receivedMessage(origin, message) {
    console.log({ origin, message });
  }
}

class Universe {
  constructor() {
    this.home = {
      x: 0,
      y: 100000000000000,
      z: 0
    };
    this.player = [0, 0, 0];
  }

  sendMessage(target, message) {
    const d = distance(target.pos, this.player);
    const SECOND = 1000;
    const delay = (d / C) * SECOND;
    console.log({ d, delay });
    setTimeout(() => {
      target.receivedMessage(this.player, message);
    }, delay);
  }
}

const U = new Universe();
const planet = new Entity(299792458, 0, 0);

U.sendMessage(planet, "hello world!");
