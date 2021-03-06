import io from "socket.io-client";
import "three";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/renderers/Projector.js";

import { Spaceship } from "./spaceship";
import { Star } from "./star";

import { Music } from "./music";

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
  constructor(music) {
    this.music = music;

    let scene = new THREE.Scene();
    this.scene = scene;

    this.scene.add(new THREE.AmbientLight(0x303030));

    const light1 = new THREE.PointLight(0xffffff, 2);
    const starGeometry = new THREE.SphereGeometry(0.5, 30, 30);
    const starMaterial = new THREE.MeshPhongMaterial({
      color: "#ffffff",
      emissive: "#f0f0f0"
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    light1.add(star);
    this.scene.add(light1);

    // light1.position.set(0, 10, 0);
    // const light2 = new THREE.PointLight(0xffffff, 5);
    // light2.position.set(0, -10, 0);
    // const light3 = new THREE.PointLight(0xffffff, 5);
    // light3.position.set(-5, -0, 0);

    // const directionalLight3 = new THREE.DirectionalLight(0xffffff, 5);
    // directionalLight1.position.set(10, -10, 10);
    // const directionalLight4 = new THREE.DirectionalLight(0xffffff, 5);
    // directionalLight1.position.set(-10, 10, -20);

    // this.scene.add(directionalLight3);
    // this.scene.add(directionalLight4);

    this.selectedSource = undefined;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const bgDustGeometry = new THREE.SphereGeometry(0.008, 32, 32);
    const bgDustMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3
    });
    for (let i = 0; i < 1000; i++) {
      const sphere = new THREE.Mesh(bgDustGeometry, bgDustMaterial);
      sphere.position.x = 12 * Math.random() - 6;
      sphere.position.y = 12 * Math.random() - 6;
      sphere.position.z = 12 * Math.random() - 6;
      scene.add(sphere);
    }

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
        const eventType =
          event.shiftKey || event.button === 2 ? "attack" : "select";
        const mouse = new THREE.Vector2();

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        //
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        const star = this.intersect(mouse);

        switch (eventType) {
          case "select": {
            if (star && star.owner === this.playerId) {
              this.selectedSource = star;
            } else {
              this.selectedSource = undefined;
            }
            break;
          }
          case "attack":
            {
              if (this.selectedSource && star) {
                socket.emit("transfer", {
                  source: this.selectedSource.id,
                  destination: star.id
                });

                this.createTempLine(
                  this.selectedSource.mesh.position,
                  star.mesh.position,
                  1000
                );
              }
            }
            break;
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
        const star = new Star(
          message.position,
          message.owner,
          this.playerId,
          message.isHome
        );
        star.id = message.from;
        star.capacity = message.capacity;
        this.objects.set(message.from, star);
        this.scene.add(star.mesh);
      }
    });

    socket.on("take-over", message => {
      const star = this.objects.get(message.from);
      if (!star) {
        return;
      }
      star.setOwner(message.owner);

      const moodShift = message.owner === this.playerId ? 1 : -1;
      this.music.setMood(this.music.getMood() + moodShift * 0.2);
    });

    socket.on("capacity-change", message => {
      const star = this.objects.get(message.from);
      if (!star) {
        return;
      }
      star.setCapacity(message.capacity, !message.wasProduced);
    });

    socket.on("heartbeat", message => {
      let ship = this.objects.get(message.from);
      if (!ship) {
        ship = new Spaceship();
        this.objects.set(message.from, ship);
        this.scene.add(ship);
      }
      ship.position.set(...message.position);
    });

    socket.on("sos", message => {
      const ship = this.objects.get(message.from);
      this.scene.remove(ship);
    });

    window.addEventListener(
      "resize",
      () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
      },
      false
    );

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

  createTempLine(from, to, duration) {
    const lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(from);
    lineGeometry.vertices.push(to);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5
    });
    let line = new THREE.Line(lineGeometry, lineMaterial);
    this.scene.add(line);

    setTimeout(() => {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
      line = undefined;
    }, duration);
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
    const star = objs.find(
      o => o.object && o.object.worldObject instanceof Star
    );
    if (star) {
      return star.object.worldObject;
    } else {
      return null;
    }
  }

  update(dt) {
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

const music = new Music();
setInterval(() => {
  const spd = (0.1 * 0.5) / 60; // back to 0.5 in 60 seconds (for 0.1 interval)

  let mood = music.getMood();
  if (mood > 0.5) {
    mood = Math.max(0.5, mood - spd);
  } else if (mood < 0.5) {
    mood = Math.min(0.5, mood + spd);
  }
  music.setMood(mood);
}, 100);

const view = new View(music);
