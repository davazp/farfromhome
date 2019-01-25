import * as THREE from "three";
import { X } from "./entity";
import "./enableThree";
import "three/examples/js/controls/OrbitControls";
import { Planet, Spaceship } from "./entity";

export class View {
  constructor(universe) {
    this.universe = universe;
    this.objects = new Map();
  }

  update() {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const planetMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("gray")
    });

    const spaceshipMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("red")
    });

    this.universe.entities.forEach(e => {
      let obj = this.objects.get(e);

      let material;

      if (e instanceof Planet) {
        material = planetMaterial;
      } else if (e instanceof Spaceship) {
        material = spaceshipMaterial;
      }

      if (!obj) {
        obj = new THREE.Mesh(geometry, material);
        this.scene.add(obj);
        this.objects.set(e, obj);
      }

      const [x, y, z] = e.pos;
      obj.position.x = x;
      obj.position.y = y;
      obj.position.z = z;

      return obj;
    });
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
