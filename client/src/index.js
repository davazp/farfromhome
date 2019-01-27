import io from "socket.io-client";
import "three";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/renderers/Projector.js";

import disc from "./textures/disc.png";
import { Spaceships } from "./spaceships";
import { Star } from "./star";

const socket = io(
  `${window.location.protocol}//${window.location.hostname}:3000${
    window.location.pathname
  }`
);

const THREE = window.THREE;

socket.on("connect", () => {
  console.log("connected");

  const playerId = sessionStorage.getItem("farfromhome_player_id");
  socket.emit("hello", {
    playerId
  });
});

socket.on("disconnect", () => {
  console.log("disconnect");
});

class View {
  constructor() {
    let scene = new THREE.Scene();
    this.scene = scene;

    this.selectedSource = undefined;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.hover = undefined;

    window.addEventListener(
      "mousemove",
      event => {
        const mouse = new THREE.Vector2();

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        //
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        const star = this.intersect(mouse);
        this.hover = star;
      },
      false
    );

    window.addEventListener(
      "mousedown",
      event => {
        const rightClick = event.button === 2;
        const mouse = new THREE.Vector2();

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        //
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        const star = this.intersect(mouse);

        if (this.selectedSource && star && rightClick) {
          console.log({ source: this.selectedSource, dest: star });
          socket.emit("transfer", {
            source: this.selectedSource.id,
            destination: star.id
          });

          const lineGeometry = new THREE.Geometry();
          lineGeometry.vertices.push(this.selectedSource.mesh.position);
          lineGeometry.vertices.push(star.mesh.position);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          this.scene.add(line);

          setTimeout(() => {
            scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
            line = undefined;
          }, 1000);
        } else {
          this.selectedSource = star;
        }
      },
      false
    );

    this.objects = new Map();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.000001,
      1000
    );

    this.controls = new THREE.OrbitControls(this.camera);

    this.spaceships = new Spaceships();
    this.scene.add(this.spaceships.mesh);

    socket.on("welcome", message => {
      // console.log("welcome", message);
      this.playerId = message.playerId;
      sessionStorage.setItem("farfromhome_player_id", this.playerId);
      console.log(`Playing as ${this.playerId}`);

      this.centerCamera(message.position);
    });

    socket.on("discovered", message => {
      // console.log("discover", message);

      if (message.type === "Planet") {
        const star = new Star(message.position, message.owner, this.playerId);
        star.id = message.from;
        star.capacity = message.capacity;
        if (message.isHome) {
          star.markHome();
        }
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
      star.setOwner(message.owner);
    });

    socket.on("capacity-change", message => {
      const star = this.objects.get(message.from);
      if (!star) {
        return;
      }
      star.setCapacity(message.capacity, !message.wasProduced);
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
    this.controls.object.position.set(x - 0.3, y - 0.3, z - 0.3);
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
    const overlay = document.getElementById("overlay");
    if (this.hover) {
      const coord = this.project(this.hover.mesh);
      overlay.style.left = coord.x + "px";
      overlay.style.top = coord.y + "px";
      overlay.style.display = "block";
      overlay.innerText = `Capacity: ${this.hover.capacity}`;
    } else {
      overlay.style.display = "none";
    }
  }

  project(object) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const vector = new THREE.Vector3();
    const projector = new THREE.Projector();

    vector.setFromMatrixPosition(object.matrixWorld);
    vector.project(this.camera);

    return {
      x: (vector.x * width) / 2 + width / 2,
      y: -((vector.y * height) / 2) + height / 2
    };
  }
}

const view = new View();
