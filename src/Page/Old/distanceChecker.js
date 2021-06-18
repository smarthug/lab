import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";

import CameraControls from "camera-controls";

import InfiniteGridHelper from "./InfiniteGridHelper";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

let tree;

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();
  const [meter , setMeter] = useState(0);
  useEffect(() => {
    Init();
    Animate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Init() {
    const background = new THREE.CubeTextureLoader()
      .setPath("textures/cube/MilkyWay/")
      .load([
        "dark-s_px.jpg",
        "dark-s_nx.jpg",
        "dark-s_py.jpg",
        "dark-s_ny.jpg",
        "dark-s_pz.jpg",
        "dark-s_nz.jpg",
      ]);

    scene = new THREE.Scene();
    scene.background = background;
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    // camera = new THREE.OrthographicCamera( window.innerWidth / - 2,  window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10000);
    // scene.add(camera);
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.xr.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.setFramebufferScaleFactor(2.0);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    camera.position.z = 5;

    cameraControls = new CameraControls(camera, renderer.domElement);

    const grid = new InfiniteGridHelper(10, 100);

    scene.add(grid);

    LightSetUp();
    Loader();
  }

  function Animate() {
    requestAnimationFrame(Animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    renderer.render(scene, camera);
  }

  function handleClick(){
    setMeter(RandomMover());
  }
  

  return (
    <div ref={containerRef}>
        <h1 style={{ position: "absolute" , left:"30px", color:"white" }}>{meter}m</h1>
      <button style={{ position: "absolute" }} onClick={handleClick}>
        Mover
      </button>
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}

//'model/bronze_replica_statue_of_liberty/scene.gltf',
//

function Loader() {
 

  const loader = new GLTFLoader()
    // .setCrossOrigin('anonymous')
    .setDRACOLoader(new DRACOLoader().setDecoderPath("assets/wasm/"))
    .setKTX2Loader(
      new KTX2Loader().setTranscoderPath("assets/wasm/").detectSupport(renderer)
    )
    .setMeshoptDecoder(MeshoptDecoder);

  const blobURLs = [];

  loader.load("model/tree_textures.gltf", (gltf) => {
    const scene2 = gltf.scene || gltf.scenes[0];
    const clips = gltf.animations || [];

    if (!scene2) {
      // Valid, but not supported by this viewer.
      throw new Error(
        "This model contains no scene, and cannot be viewed here. However," +
          " it may contain individual 3D resources."
      );
    }

    // this.setContent(scene, clips);

    // blobURLs.forEach(URL.revokeObjectURL);

    // See: https://github.com/google/draco/issues/349
    // DRACOLoader.releaseDecoderModule();

    // resolve(gltf);
    scene.add(scene2);
    tree = scene2;
    tree.scale.set(10, 10, 10);
  });
}

function LightSetUp() {
  const light = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(light);

  // White directional light at half intensity shining from the top.
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);

  const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
  scene.add(hemiLight);

  const spotLight = new THREE.SpotLight(0xffa95c, 4);
  spotLight.position.set(-50, 350, 50);
  spotLight.castShadow = true;
  scene.add(spotLight);
}

function Mover() {
  // tree.position.set(0,0,10)
  tree.position.add(new THREE.Vector3(0, 0, -10));
}

function RandomMover() {
    let foo = getRandomInt(-100)
  tree.position.set(0,0,foo)

  return foo
//   tree.position.add(new THREE.Vector3(0, 0, getRandomInt(-100)));
}

function getRandomInt(max) {
    //   return Math.floor(Math.random() * max);
    let foo = round10(Math.floor(Math.random() * max), 1);
    console.log(foo);
    return foo;
  }



/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === "undefined" || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Shift back
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
}

// Decimal round
const round10 = (value, exp) => decimalAdjust("round", value, exp);
// Decimal floor
// const floor10 = (value, exp) => decimalAdjust("floor", value, exp);
// Decimal ceil
// const ceil10 = (value, exp) => decimalAdjust("ceil", value, exp);
