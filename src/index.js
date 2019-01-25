import * as THREE from 'three';
import {X} from './entity';
import './enableThree';
import 'three/examples/js/controls/OrbitControls';

console.log(X);

const getBoxes = () => {

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material1 = new THREE.MeshBasicMaterial({ color: new THREE.Color('skyblue') });
    var material2 = new THREE.MeshBasicMaterial({ color: new THREE.Color('blue') });
    var material3 = new THREE.MeshBasicMaterial({ color: new THREE.Color('green') });
    var material4 = new THREE.MeshBasicMaterial({ color: new THREE.Color('red') });
    var material5 = new THREE.MeshBasicMaterial({ color: new THREE.Color('yellow') });
    var material6 = new THREE.MeshBasicMaterial({ color: new THREE.Color('orange') });

    var cube1 = new THREE.Mesh(geometry, material1);
    var cube2 = new THREE.Mesh(geometry, material2);
    var cube3 = new THREE.Mesh(geometry, material3);
    var cube4 = new THREE.Mesh(geometry, material4);
    var cube5 = new THREE.Mesh(geometry, material5);
    var cube6 = new THREE.Mesh(geometry, material6);

    cube1.position.x = 0;
    cube1.position.y = 0;
    cube1.position.z = 5;

    cube2.position.x = 0;
    cube2.position.y = 0;
    cube2.position.z = -5;

    cube3.position.x = 5;
    cube3.position.y = 0;
    cube3.position.z = 0;

    cube4.position.x = -5;
    cube4.position.y = 0;
    cube4.position.z = 0;

    cube5.position.x = 0;
    cube5.position.y = 5;
    cube5.position.z = 0;

    cube6.position.x = 0;
    cube6.position.y = -5;
    cube6.position.z = 0;

    return [cube1, cube2, cube3, cube4, cube5, cube6]
}

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let controls = new THREE.OrbitControls( camera );

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;



var radius = 5;
var segments = 30;
var rings = 30;

var geometry = new THREE.SphereGeometry(radius, segments, rings);
var material = new THREE.MeshBasicMaterial({
  color: 0xF3A2B0,
  wireframe: true
});

var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// scene.add(...getBoxes())

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	controls.update();
}
animate();