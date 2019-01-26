const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const { C, Λ } = require("./constants");

const Universe = require("./universe");

const Player = require("./player");
const Planet = require("./planet");
const Spaceship = require("./spaceship");
const { random, distance } = require("./vector-utils");

const universe = new Universe();

for (let i = 0; i < 75; i++) {
  const pos = random(Λ);
  if (distance([0, 0, 0], pos) <= Λ) {
    const p = new Planet(pos);
    universe.addEntity(p);
  }
}

setInterval(() => {
  universe.tick(0.1);
}, 100);

function createPlayer(socket) {
  const availablePlanets = universe.entities.filter(
    e => e.constructor.name === "Planet" && !e.owner
  );
  const ix = Math.floor(availablePlanets.length * Math.random());
  const homePlanet = availablePlanets[ix];

  homePlanet.capacity = 10;
  homePlanet.broadcast("capacity-change", { capacity: 10 });

  const player = new Player(homePlanet.position, socket);
  universe.addEntity(player);

  homePlanet.takeOver(player);

  return player;
}

function getOrCreatePlayer(playerId, socket) {
  let player = universe.entities.find(
    e => e instanceof Player && e.id === playerId
  );
  if (!player) {
    player = createPlayer(socket);
  } else {
    player.socket.disconnect(true);
    player.socket = socket;
  }
  return player;
}

io.on("connection", function(socket) {
  let player;

  socket.on("hello", info => {
    player = getOrCreatePlayer(info.playerId, socket);
    socket.emit("welcome", {
      playerId: player.id,
      position: player.position
    });

    universe.entities.forEach(e => {
      if (e instanceof Planet) {
        player.sendMessage(e, "discovered", {
          type: e.constructor.name,
          owner: e.owner && e.owner.id,
          capacity: e.capacity,
          position: e.position
        });
      }
    });
  });

  socket.on("transfer", info => {
    console.log({ info });
    const source = universe.getEntityById(info.source);
    const destination = universe.getEntityById(info.destination);
    console.log({ s: source.id, d: destination.id });
    if (!source || !destination) return;

    source.sendMessage(player, "transfer", {
      source,
      destination
    });
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
