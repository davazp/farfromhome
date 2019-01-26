import io from "socket.io-client";
import * as THREE from "three";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";

import disc from "./textures/disc.png";

import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

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
    this.radar = new Map();

    this.positions = new Float32Array(COUNT_OBJS * 3);
    this.colors = new Float32Array(COUNT_OBJS * 3);
    this.sizes = new Float32Array(COUNT_OBJS);

    for (let i = 0; i < COUNT_OBJS; i++) {
      const color = new THREE.Color("red");
      color.toArray(this.colors, i * 3);
      this.sizes[i] = 1;
    }

    const knownIds = [];

    socket.on("message", message => {
      console.log({ message });

      let idx = knownIds.indexOf(message.from);
      if (idx < 0) {
        knownIds.push(message.from);
        idx = knownIds.length - 1;
      }

      const v = new THREE.Vector3(...message.position);

      v.toArray(this.positions, idx * 3);
      const color = new THREE.Color("yellow");
      color.toArray(this.colors, idx * 3);
      this.sizes[idx] = 1;

      this.pointsGeometry.attributes.position.needsUpdate = true;
      this.pointsGeometry.attributes.customColor.needsUpdate = true;
    });
  }

  createPoints() {
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );
    geometry.addAttribute(
      "customColor",
      new THREE.BufferAttribute(this.colors, 3)
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
      alphaTest: 0.9
    });
    //
    let particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    return geometry;
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
    camera.position.z = 5;

    const radius = 5;
    const segments = 30;
    const rings = 30;

    const geometry = new THREE.SphereGeometry(radius, segments, rings);
    const material = new THREE.MeshBasicMaterial({
      color: 0x303030,
      wireframe: true
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    this.pointsGeometry = this.createPoints();

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    }
    animate();
  }
}

const view = new View();
view.start();
