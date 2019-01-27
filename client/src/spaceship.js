import * as THREE from "three";

export class Spaceship extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.01, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    super(geometry, material);
  }

  update(dt) {}
}
