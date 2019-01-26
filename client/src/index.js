import io from "socket.io-client";
import * as THREE from "three";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";

import disc from "./textures/disc.png";

import { Star } from "./star";

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
    this.time = 1.0;
    this.radar = new Map();

    this.objects = [];

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

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    socket.on("heartbeat", message => {
      const idx = this.getEntityIdx(message.from);
      const c = new THREE.Vector4(1, 1, 1, 1);
      this.updateEntityPosition(idx, message.position, c);
    });

    // socket.on("take-over", message => {
    //   this.createStar(message.position);
    // });

    socket.on("welcome", message => {
      const [x, y, z] = message.position;
      this.camera.position.x = x;
      this.camera.position.y = y;
      this.camera.position.z = z - 10;
      // this.camera.lookAt(x, y, z);
    });

    socket.on("discovered", message => {
      if (message.type === "Planet") {
        const star = new Star(message.position);
        this.objects.push(star);
        this.scene.add(star.mesh);
      }
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

  update() {
    this.objects.forEach(o => o.update());
  }

  start() {
    let scene = new THREE.Scene();
    this.scene = scene;

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(this.camera);

    this.pointsGeometry = this.createPoints();

    const animate = () => {
      this.time += 0.01;
      this.update();
      requestAnimationFrame(animate);
      renderer.render(scene, this.camera);
      controls.update();
    };
    animate();
  }
}

const view = new View();
view.start();
