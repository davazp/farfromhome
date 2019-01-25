import { Universe } from "./entity";
import { View } from "./view";

const universe = new Universe();
const view = new View(universe);

view.start();
view.update();

setInterval(() => {
  universe.tick(0.01);
  view.update();
}, 10);
