import * as THREE from "three";

import lavatile_red from "./textures/lavatile_red.jpg";
import lavatile_green from "./textures/lavatile_green.jpg";
import lavatile_grey from "./textures/lavatile_grey.jpg";
import cloud from "./textures/cloud.png";

import lavaVertexShader from "./starVertexShader.glsl";
import lavaFragmentShader from "./starFragmentShader.glsl";

export class Star {
  constructor([x, y, z], color) {
    const radius = 1;
    const segments = 30;
    const rings = 30;

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(radius, segments, rings);

    const uniforms = {
      fogDensity: { value: 0.01 },
      fogColor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: 1.0 },
      uvScale: { value: new THREE.Vector2(3.0, 1.0) },
      alpha: { value: 1.0 },
      texture1: { value: textureLoader.load(cloud) },
      texture2: {
        value: textureLoader.load(
          color === "grey"
            ? lavatile_grey
            : color === "red"
            ? lavatile_red
            : lavatile_green
        )
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
  }

  update() {
    this.mesh.material.uniforms.time.value += 0.01;
  }

  setColor(color) {
    const textureLoader = new THREE.TextureLoader();
    this.mesh.material.uniforms.texture2.value = textureLoader.load(
      color === "grey"
        ? lavatile_grey
        : color === "red"
        ? lavatile_red
        : lavatile_green
    );
  }
}
