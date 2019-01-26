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

    window.addEventListener(
      "mousedown",
      event => {
        const mouse = new THREE.Vector2();
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        //
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        const star = this.intersect(mouse);
        if (star) {
          const { x, y, z } = star.mesh.position;
          this.centerCamera([x, y, z]);
        }
      },
      false
    );

    this.time = 1.0;
    this.radar = new Map();

    this.objects = new Map();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.controls = new THREE.OrbitControls(this.camera);

    this.spaceships = new Spaceships();
    this.scene.add(this.spaceships.mesh);

    socket.on("heartbeat", message => {
      const c = new THREE.Vector4(1, 1, 1, 1);
      this.spaceships.updateEntityPosition(message.from, message.position, c);
    });

    // socket.on("take-over", message => {
    //   this.createStar(message.position);
    // });

    socket.on("welcome", message => {
      console.log("welcome", message);
      this.playerId = message.playerId;
      this.centerCamera(message.position);
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
      const c = new THREE.Vector4(1, 1, 1, 1);
      this.spaceships.updateEntityPosition(message.from, message.position);
      this.spaceships.updateEntityColor(message.from, c);
    });

    socket.on("sos", message => {
      // console.log("sos", message);
      const c = new THREE.Vector4(1, 0, 0, 1);
      this.spaceships.updateEntityPosition(message.from, message.position);
      this.spaceships.updateEntityColor(message.from, c);
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
        this.controls.update();
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    start();
  }

  centerCamera([x, y, z]) {
    this.controls.object.position.set(x + 3, y + 3, z + 3);
    this.controls.target = new THREE.Vector3(x, y, z);
    this.controls.update();
  }

  intersect(position) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(position, this.camera);
    const objs = raycaster.intersectObjects(this.scene.children);
    if (objs.length > 0) {
      const obj = objs[0].object.worldObject;
      return obj;
    } else {
      return null;
    }
  }

  update(dt) {
    this.spaceships.update(dt);
    this.objects.forEach(o => o.update(dt));
  }
}

const view = new View();
