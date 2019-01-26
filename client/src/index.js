import io from "socket.io-client";
import * as THREE from "three";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";

const socket = io("http://localhost:3000/");

socket.on("connect", () => {
  console.log("connected");
});

socket.on("disconnect", () => {
  console.log("disconnect");
});

class View {
  constructor() {
    this.radar = new Map();
    socket.on("message", message => {
      this.updateEntity(message.from, message.position);
    });
  }

  getOrMakeEntity(id) {
    let obj = this.radar.get(id);
    if (!obj) {
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color("red")
      });
      obj = new THREE.Mesh(geometry, material);
      this.scene.add(obj);
      this.radar.set(id, obj);
    }
    return obj;
  }

  updateEntity(id, position) {
    const obj = this.getOrMakeEntity(id);
    const [x, y, z] = position;
    obj.position.x = x;
    obj.position.y = y;
    obj.position.z = z;
    return obj;
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
