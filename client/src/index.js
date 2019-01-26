import io from "socket.io-client";
import * as THREE from "three";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";

import disc from "./textures/disc.png";

import lavatile from "./textures/lavatile.jpg";
import cloud from "./textures/cloud.png";

import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import lavaVertexShader from "./lavaVertexShader.glsl";
import lavaFragmentShader from "./lava.glsl";

const socket = io("http://localhost:3000/");

socket.on("connect", () => {
  console.log("connected");
});

socket.on("disconnect", () => {
  console.log("disconnect");
});

const COUNT_OBJS = 100;

class View {
  constructor() {
    this.time = 1.0;
    this.radar = new Map();
    this.positions = new Float32Array(COUNT_OBJS * 3);
    this.colors = new Float32Array(COUNT_OBJS * 4);
    this.sizes = new Float32Array(COUNT_OBJS);
    for (let i = 0; i < COUNT_OBJS; i++) {
      const c = new THREE.Vector4(1, 0, 0, 0);
      c.toArray(this.colors, i * 4);
      this.sizes[i] = 1;
    }

    const knownIds = [];
    this.getEntityIdx = id => {
      let idx = knownIds.indexOf(id);
      if (idx < 0) {
        knownIds.push(id);
        idx = knownIds.length - 1;
      }
      return idx;
    };

    socket.on("heartbeat", message => {
      const idx = this.getEntityIdx(message.from);
      const c = new THREE.Vector4(1, 1, 1, 1);
      this.updateEntityPosition(idx, message.position, c);
    });

    socket.on("sos", message => {
      const idx = this.getEntityIdx(message.from);
      const c = new THREE.Vector4(1, 0, 0, 1);
      this.updateEntityPosition(idx, message.position, c);
    });

    setInterval(() => {
      for (let i = 0; i < COUNT_OBJS; i++) {
        this.colors[i * 4 + 3] = Math.max(0, this.colors[i * 4 + 3] - 0.005);
      }
      this.pointsGeometry.attributes.customColor.needsUpdate = true;
    }, 10);
  }

  updateEntityPosition(idx, [x, y, z], color) {
    const v = new THREE.Vector3(x, y, z);
    v.toArray(this.positions, idx * 3);
    color.toArray(this.colors, idx * 4);
    this.sizes[idx] = 1;
    this.pointsGeometry.attributes.position.needsUpdate = true;
    this.pointsGeometry.attributes.customColor.needsUpdate = true;
  }

  createPoints() {
    const geometry = new THREE.BufferGeometry();
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
    this.scene.add(particles);

    return geometry;
  }

  createStar() {
    const radius = 5;
    const segments = 30;
    const rings = 30;

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(radius, segments, rings);

    const uniforms = {
      fogDensity: { value: 0.01 },
      fogColor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: this.time },
      uvScale: { value: new THREE.Vector2(3.0, 1.0) },
      texture1: { value: textureLoader.load(cloud) },
      texture2: { value: textureLoader.load(lavatile) }
    };
    uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT =
      THREE.RepeatWrapping;
    uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT =
      THREE.RepeatWrapping;
    var size = 0.65;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: lavaVertexShader,
      fragmentShader: lavaFragmentShader
    });

    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    return cube;
  }

  start() {
    let scene = new THREE.Scene();
    this.scene = scene;

    let camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 20;

    this.star = this.createStar();
    this.pointsGeometry = this.createPoints();

    const animate = () => {
      this.star.material.uniforms.time.value += 0.01;

      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    };
    animate();
  }
}

const view = new View();
view.start();
