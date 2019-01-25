const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/", function(_req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  console.log("a user connected");
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
