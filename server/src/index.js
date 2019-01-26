const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const Universe = require("./universe");

const universe = new Universe(io);

setInterval(() => {
  universe.tick(0.1);
}, 100);

setTimeout(() => {
  universe.player.broadcast("goto", { target: universe.somePlanet });
}, 1000);

io.on("connection", function(socket) {
  socket.on("message", _message => {
    socket.emit("message", { type: "pong" });
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
