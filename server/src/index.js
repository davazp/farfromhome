const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const Universe = require("./universe");

const Player = require("./player");
const Planet = require("./planet");
const { random } = require("./vector-utils");

const universe = new Universe(io);

setInterval(() => {
  universe.tick(0.1);
}, 100);

io.on("connection", function(socket) {
  const pos = random();

  const player = new Player(pos, socket);
  const planet = new Planet(pos);

  universe.addEntity(planet);
  universe.addEntity(player);

  planet.takeOver(player);

  socket.emit("welcome", {
    position: pos
  });

  universe.entities.forEach(e => {
    player.sendMessage(e, "discovered", {
      type: e.constructor.name,
      position: e.position
    });
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
