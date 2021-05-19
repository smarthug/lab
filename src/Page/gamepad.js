import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";

import CameraControls from "camera-controls";

import InfiniteGridHelper from "./InfiniteGridHelper";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import nipplejs from "nipplejs";

CameraControls.install({ THREE: THREE });

const KEY_W = 87;
const KEY_UP = 38;
const KEY_S = 83;
const KEY_DOWN = 40;
const KEY_A = 65;
const KEY_LEFT = 37;
const KEY_D = 68;
const KEY_RIGHT = 39;
const KEY_SPACE = 32;

let playerSpeed = 5.5;

let horizonAxis = 0;
let verticalAxis = 0;

let unitMoveVector = new THREE.Vector3();

let moveVector = new THREE.Vector3();

let cameraVector = new THREE.Vector3();
let rightCameraVector = new THREE.Vector3();

let tmpQuaternion = new THREE.Quaternion();
let tmpMatrix = new THREE.Matrix4();

let centerVec = new THREE.Vector3(0, 0, 0);
let upVec = new THREE.Vector3(0, 1, 0);

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

let scene, camera, renderer, cameraControls;
let mixer;
const clock = new THREE.Clock();

let idleAction, walkAction, runAction;

let player;

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();
  const joystickConRef = useRef();
  const [meter, setMeter] = useState(0);
  useEffect(() => {
    Init();
    Animate();

    window.addEventListener("resize", resizer);

    var manager = nipplejs.create({
      zone: joystickConRef.current,
      // mode: 'static',
      // position: { left: '5%', top: '90%' },
      // color: 'red'
    });

    manager.on("move", function (evt, data) {
      console.log(data.vector);
      const { x, y } = data.vector;
      horizonAxis = -x;
      verticalAxis = y;

      runAction.play();
      idleAction.stop();
    });

    manager.on("end", function (evt, data) {
      horizonAxis = 0;
      verticalAxis = 0;

      runAction.stop();
      idleAction.play();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resizer() {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    // Set the camera's aspect ratio
    console.log(window.innerWidth);
    camera.aspect = window.innerWidth / window.innerHeight;

    // update the camera's frustum
    camera.updateProjectionMatrix();

    // update the size of the renderer AND the canvas
    renderer.setSize(window.innerWidth, window.innerHeight);

    // set the pixel ratio (for mobile devices)
    renderer.setPixelRatio(window.devicePixelRatio);
  }

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

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    // renderer.xr.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.xr.setFramebufferScaleFactor(2.0);

    camera.position.set(5, 10, 10);
    cameraControls = new CameraControls(camera, renderer.domElement);

    const grid = new InfiniteGridHelper(10, 100);
    scene.add(grid);

    LightSetUp();
    Loader();
  }

  function Animate() {
    requestAnimationFrame(Animate);

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);
    if (mixer) {
      mixer.update(delta);
    }

    moveVector.set(
      camera.getWorldDirection(cameraVector).x,
      0,
      camera.getWorldDirection(cameraVector).z
    );

    rightCameraVector.copy(moveVector);

    rightCameraVector.applyAxisAngle(upVec, Math.PI / 2);

    rightCameraVector.multiplyScalar(horizonAxis);

    moveVector.multiplyScalar(verticalAxis);

    unitMoveVector.addVectors(moveVector, rightCameraVector);

    // 역시 예측대로 , 조이스틱에서는 노말라이즈 할 필요가 없을 듯 ....
    // 조이스틱인지 키보드 인지에 따라 또 달라지겠구먼 ...
    unitMoveVector.normalize();

    if (verticalAxis !== 0 || horizonAxis !== 0) {
      unitMoveVector.multiplyScalar(delta).multiplyScalar(playerSpeed);
      player.position.add(unitMoveVector);

      tmpMatrix.lookAt(centerVec, unitMoveVector, upVec);

      tmpQuaternion.setFromRotationMatrix(tmpMatrix);
      player.setRotationFromQuaternion(tmpQuaternion);
    }

    renderer.render(scene, camera);
  }

  function handleClick() {
    Mover();
  }

  return (
    <div style={{ width: "100%", height: "100vh", overflow:"hidden" }} ref={containerRef}>
      <div
        ref={joystickConRef}
        style={{
          position: "absolute",
          bottom: "50px",
        //   left: "5px",
          color: "white",
          width: "100px",
          height: "100px",
        }}
      />

      {/* <button style={{ position: "absolute" }} onClick={handleClick}>
        Mover
      </button> */}
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}

function Loader() {
  const loader = new GLTFLoader()
    // .setCrossOrigin('anonymous')
    .setDRACOLoader(new DRACOLoader().setDecoderPath("assets/wasm/"))
    .setKTX2Loader(
      new KTX2Loader().setTranscoderPath("assets/wasm/").detectSupport(renderer)
    )
    .setMeshoptDecoder(MeshoptDecoder);

  const blobURLs = [];

  loader.load("model/Soldier.glb", (gltf) => {
    const scene2 = gltf.scene || gltf.scenes[0];
    const clips = gltf.animations || [];
    if (!scene2) {
      // Valid, but not supported by this viewer.
      throw new Error(
        "This model contains no scene, and cannot be viewed here. However," +
          " it may contain individual 3D resources."
      );
    }
    player = scene2;
    scene.add(player);
    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(player);
    idleAction = mixer.clipAction(animations[0]);
    walkAction = mixer.clipAction(animations[3]);
    runAction = mixer.clipAction(animations[1]);
    idleAction.play();
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
  //   var vector = new THREE.Vector3(1, 0, 0);
  console.log(cameraVector);
  rightCameraVector.copy(cameraVector);

  var axis = new THREE.Vector3(0, 1, 0);
  var angle = Math.PI / 2;

  rightCameraVector.applyAxisAngle(axis, angle);

  console.log(rightCameraVector);
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case KEY_W:
    case KEY_UP:
      // this.isUp = true;
      verticalAxis = 1;
      runAction.play();
      idleAction.stop();
      //   console.log(verticalAxis);
      break;

    case KEY_S:
    case KEY_DOWN:
      // this.isDown = true;
      runAction.play();
      idleAction.stop();
      verticalAxis = -1;
      break;

    case KEY_A:
    case KEY_LEFT:
      horizonAxis = 1;
      runAction.play();
      idleAction.stop();
      // this.isLeft = true;
      break;

    case KEY_D:
    case KEY_RIGHT:
      horizonAxis = -1;
      runAction.play();
      idleAction.stop();
      // this.isRight = true;
      break;

    case KEY_SPACE:
      // this.jump();
      break;

    default:
      return;
  }
}

function onKeyUp(event) {
  switch (event.keyCode) {
    case KEY_W:
    case KEY_UP:
      // this.isUp = false;
      verticalAxis = 0;
      shouldRunStop();
      //   console.log(verticalAxis);
      break;

    case KEY_S:
    case KEY_DOWN:
      // this.isDown = false;
      //   idleAction.play();
      verticalAxis = 0;
      shouldRunStop();
      break;

    case KEY_A:
    case KEY_LEFT:
      horizonAxis = 0;
      shouldRunStop();
      // this.isLeft = false;
      break;

    case KEY_D:
    case KEY_RIGHT:
      horizonAxis = 0;
      shouldRunStop();
      // this.isRight = false;
      break;

    case KEY_SPACE:
      break;

    default:
      return;
  }
}

function shouldRunStop() {
  if (horizonAxis === 0 && verticalAxis === 0) {
    runAction.stop();
    idleAction.play();
  }
}
