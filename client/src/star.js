import * as THREE from "three";

export class Star {
  constructor([x, y, z], owner, playerId, isHome) {
    const radius = 0.1;
    const segments = 30;
    const rings = 30;

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(radius, segments, rings);

    const isStar = Math.random() < 0.1;

    this.owner = owner;
    this.playerId = playerId;
    this.capacity = 0;
    this.isHome = isHome;

    var size = 0.65;

    const material = new THREE.MeshPhongMaterial({
      color: "#ff0000",
      shininess: 5
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.worldObject = this;

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    this.mesh = mesh;
    this.mesh.worldObject = this;

    this.setOwner(owner);
  }

  update(dt) {
    // this.mesh.material.uniforms.time.value += dt;
    // this.mesh.material.uniforms.alpha.value = Math.max(
    //   0.5,
    //   this.mesh.material.uniforms.alpha.value - 0.25 * dt
    // );
  }

  setOwner(owner) {
    this.owner = owner;

    // console.log(this.owner, this.playerId);
    if (this.owner === this.playerId) {
      this.mesh.material.color.set(this.isHome ? "#00ff33" : "#0077ff");
    } else if (this.owner) {
      this.mesh.material.color.set("#ff5500");
    } else {
      this.mesh.material.color.set("#505050");
    }
    this.mesh.material.needsUpdate = true;
  }

  setCapacity(cap, shouldNotify) {
    this.capacity = cap;
    // if (shouldNotify) {
    //   this.mesh.material.uniforms.alpha.value = 1;
    // }
  }
}
