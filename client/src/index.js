import io from "socket.io-client";
import * as THREE from "three";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";

import disc from "./textures/disc.png";

import { Spaceships } from "./spaceships";
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

class View {
  constructor() {
    let scene = new THREE.Scene();
    this.scene = scene;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.time = 1.0;
    this.radar = new Map();

    this.objects = [];

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    let controls = new THREE.OrbitControls(this.camera);

    this.spaceships = new Spaceships();
    this.scene.add(this.spaceships.mesh);

    socket.on("heartbeat", message => {
      const idx = this.spaceships.getEntityIdx(message.from);
      const c = new THREE.Vector4(1, 1, 1, 1);
      this.spaceships.updateEntityPosition(idx, message.position, c);
    });

    // socket.on("take-over", message => {
    //   this.createStar(message.position);
    // });

    socket.on("welcome", message => {
      console.log("welcome", message);
      const [x, y, z] = message.position;

      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.position.z = 10;

      // this.camera.position.x = x;
      // this.camera.position.y = y;
      // this.camera.position.z = z - 10;
      // this.camera.lookAt(x, y, z);
    });

    socket.on("discovered", message => {
      console.log("discover", message);

      if (message.type === "Planet") {
        const star = new Star(message.position);
        this.objects.push(star);
        this.scene.add(star.mesh);
      }
    });

    socket.on("heartbeat", message => {
      // console.log("heartbeat", message);
      const idx = this.spaceships.getEntityIdx(message.from);
      const c = new THREE.Vector4(1, 1, 1, 1);
      this.spaceships.updateEntityPosition(idx, message.position, c);
    });

    socket.on("sos", message => {
      // console.log("sos", message);
      const idx = this.spaceships.getEntityIdx(message.from);
      const c = new THREE.Vector4(1, 0, 0, 1);
      this.spaceships.updateEntityPosition(idx, message.position, c);
    });

    const start = () => {
      const animate = () => {
        this.time += 0.01;
        this.update();
        requestAnimationFrame(animate);
        this.renderer.render(scene, this.camera);
        controls.update();
      };
      animate();
    };

    start();
  }

  update() {
    this.spaceships.update();
    this.objects.forEach(o => o.update());
  }
}

const view = new View();
