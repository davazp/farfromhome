import { Universe } from "./entity";
import { View } from "./view";

import io from "socket.io-client";

const universe = new Universe();
const view = new View(universe);

const socket = io("http://localhost:3000/");

socket.on("connect", function() {
  console.log("connected");
});
socket.on("event", function(data) {
  console.log("event", { data });
});
socket.on("disconnect", function() {
  console.log("disconnect");
});

view.start();
view.update();

setInterval(() => {
  universe.tick(0.01);
  view.update();
}, 10);
