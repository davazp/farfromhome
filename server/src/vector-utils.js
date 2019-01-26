const { Λ } = require("./constants");

function distance(p1, p2) {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
  );
}

function speed(v) {
  return distance(v, [0, 0, 0]);
}

function scale(v, x) {
  return [v[0] * x, v[1] * x, v[2] * x];
}

function difference(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function velocity(from, to, spd) {
  const dir = difference(to, from);
  return scale(dir, spd / speed(dir));
}

function random() {
  return [
    Λ * (2 * Math.random() - 1),
    Λ * (2 * Math.random() - 1),
    Λ * (2 * Math.random() - 1)
  ];
}

module.exports = {
  distance,
  speed,
  scale,
  difference,
  velocity
};
