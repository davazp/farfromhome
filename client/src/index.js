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

    this.objects = new Map();

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

      this.playerId = message.playerId;

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
        const star = new Star(
          message.position,
          message.owner
            ? message.owner === this.playerId
              ? "green"
              : "red"
            : "grey"
        );
        this.objects.set(message.from, star);
        this.scene.add(star.mesh);
      }
    });

    socket.on("take-over", message => {
      console.log({ message });
      const star = this.objects.get(message.from);
      if (!star) {
        return;
      }
      star.setColor(
        message.owner
          ? message.owner === this.playerId
            ? "green"
            : "red"
          : "grey"
      );
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

    let prevTimestamp;
    const start = () => {
      const animate = timestamp => {
        if (!prevTimestamp) prevTimestamp = timestamp;
        const dt = (timestamp - prevTimestamp) / 1000;
        prevTimestamp = timestamp;
        this.time += dt;
        this.update(dt);
        this.renderer.render(scene, this.camera);
        controls.update();
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    start();
  }

  update(dt) {
    this.spaceships.update(dt);
    this.objects.forEach(o => o.update(dt));
  }
}

const view = new View();
