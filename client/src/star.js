import * as THREE from "three";

import lavatile_red from "./textures/lavatile_red.jpg";
import lavatile_green from "./textures/lavatile_green.jpg";
import lavatile_blue from "./textures/lavatile_blue.jpg";
import lavatile_grey from "./textures/lavatile_grey.jpg";
import cloud from "./textures/cloud.png";

import lavaVertexShader from "./starVertexShader.glsl";
import lavaFragmentShader from "./starFragmentShader.glsl";

export class Star {
  constructor([x, y, z], owner, playerId) {
    const radius = 0.1;
    const segments = 30;
    const rings = 30;

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(radius, segments, rings);

    this.owner = owner;
    this.playerId = playerId;
    this.capacity = 0;
    this.isHome = false;

    const uniforms = {
      fogDensity: { value: 0.01 },
      fogColor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: 1.0 },
      uvScale: { value: new THREE.Vector2(3.0, 1.0) },
      alpha: { value: 1.0 },
      texture1: { value: textureLoader.load(cloud) },
      texture2: {
        value: this.getTextureForOwner(this.owner)
      }
    };
    uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT =
      THREE.RepeatWrapping;
    uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT =
      THREE.RepeatWrapping;

    this.uniforms = uniforms;

    var size = 0.65;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: lavaVertexShader,
      fragmentShader: lavaFragmentShader,
      transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    this.mesh = mesh;
    this.mesh.worldObject = this;
  }

  update(dt) {
    this.mesh.material.uniforms.time.value += dt;
    this.mesh.material.uniforms.alpha.value = Math.max(
      0.5,
      this.mesh.material.uniforms.alpha.value - 0.25 * dt
    );
  }

  getTextureForOwner(owner) {
    const textureLoader = new THREE.TextureLoader();
    return textureLoader.load(
      !owner
        ? lavatile_grey
        : owner === this.playerId
        ? this.isHome
          ? lavatile_green
          : lavatile_blue
        : lavatile_red
    );
  }

  setOwner(owner) {
    if (this.owner === owner) {
      return;
    }
    this.owner = owner;

    this.mesh.material.uniforms.alpha.value = 1;
    this.mesh.material.uniforms.texture2.value = this.getTextureForOwner(
      this.owner
    );
  }

  markHome() {
    this.isHome = true;
    this.mesh.material.uniforms.texture2.value = this.getTextureForOwner(
      this.owner
    );
  }

  setCapacity(cap, shouldNotify) {
    this.capacity = cap;
    if (shouldNotify) {
      this.mesh.material.uniforms.alpha.value = 1;
    }
  }
}
