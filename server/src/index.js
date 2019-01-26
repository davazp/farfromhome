const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const { C, Λ } = require("./constants");

const Universe = require("./universe");

const Player = require("./player");
const Planet = require("./planet");
const Spaceship = require("./spaceship");
const { random } = require("./vector-utils");

const universe = new Universe(io);

setInterval(() => {
  universe.tick(0.1);
}, 100);

io.on("connection", function(socket) {
  const pos = random(Λ);

  const player = new Player(pos, socket);
  const planet = new Planet(pos);

  universe.addEntity(planet);
  universe.addEntity(player);

  planet.takeOver(player);

  socket.emit("welcome", {
    playerId: player.id,
    position: pos
  });

  universe.entities.forEach(e => {
    console.log(e.constructor.name);
    if (e instanceof Planet) {
      player.sendMessage(e, "discovered", {
        type: e.constructor.name,
        owner: e.owner.id,
        position: e.position
      });
    }
  });

  for (let i = 0; i < 100; i++) {
    const s = new Spaceship(random(Λ), player);
    s.updateVelocity(random(C));
    universe.addEntity(s);
  }
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
