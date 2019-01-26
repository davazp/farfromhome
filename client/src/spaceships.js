import * as THREE from "three";
import disc from "./textures/disc.png";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

const COUNT_OBJS = 100;

export class Spaceships {
  constructor() {
    this.positions = new Float32Array(COUNT_OBJS * 3);
    this.colors = new Float32Array(COUNT_OBJS * 4);
    this.sizes = new Float32Array(COUNT_OBJS);

    const knownIds = [];
    this.getEntityIdx = id => {
      let idx = knownIds.indexOf(id);
      if (idx < 0) {
        knownIds.push(id);
        idx = knownIds.length - 1;
      }
      return idx;
    };

    for (let i = 0; i < COUNT_OBJS; i++) {
      const c = new THREE.Vector4(1, 0, 0, 0);
      c.toArray(this.colors, i * 4);
      this.sizes[i] = 1;
    }

    const geometry = new THREE.BufferGeometry();
    this.geometry = geometry;
    geometry.addAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );
    geometry.addAttribute(
      "customColor",
      new THREE.BufferAttribute(this.colors, 4)
    );
    geometry.addAttribute("size", new THREE.BufferAttribute(this.sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        texture: {
          value: new THREE.TextureLoader().load(disc)
        }
      },
      vertexShader,
      fragmentShader,
      transparent: true
    });
    let particles = new THREE.Points(geometry, material);

    this.mesh = particles;
  }

  updateEntityPosition(idx, [x, y, z], color) {
    const v = new THREE.Vector3(x, y, z);
    v.toArray(this.positions, idx * 3);
    color.toArray(this.colors, idx * 4);
    this.sizes[idx] = 1;
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.customColor.needsUpdate = true;
  }

  update() {
    for (let i = 0; i < COUNT_OBJS; i++) {
      this.colors[i * 4 + 3] = Math.max(0, this.colors[i * 4 + 3] - 0.005);
    }
    this.geometry.attributes.customColor.needsUpdate = true;
  }
}
