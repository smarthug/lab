import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

import { resizer, SceneSetUp } from "../Utils/utils";

import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

// import SpatialControls from "../Utils/SpatialControls";
import SpatialControls  from "../Utils/JoystickSpatialControls";

import Loader from "../Utils/loader";

CameraControls.install({ THREE: THREE });

let spatialControls;
let bool = false;

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

let cameraRig;

var controller1, controller2;
let controllerGrip1, controllerGrip2;

let player, destination;

let playerPos = new THREE.Vector3();
let destinationPos = new THREE.Vector3();

let result = new THREE.Vector3();

let tmp = new THREE.Vector3();
let tmpQuaternion = new THREE.Quaternion();

let multipliedScalar = 3;

function TranslateHelperGeometry() {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3)
  );

  return geometry;
}

const matHelper = new THREE.MeshBasicMaterial({
  depthTest: false,
  depthWrite: false,
  transparent: true,
  side: THREE.DoubleSide,
  fog: false,
  toneMapped: false,
});

let deltaLine = new THREE.Line(TranslateHelperGeometry(), matHelper);
let deltaLine2 = new THREE.Line(TranslateHelperGeometry(), matHelper);

let box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshNormalMaterial({ wireframe: true })
);

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();
  useEffect(() => {
    Init();
    // Animate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
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
    scene.add(cube);
    // camera.position.y = 10;

    vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

    renderer.setAnimationLoop(Animate);

    // cameraRig = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial({ wireframe: true }));
    cameraRig = new THREE.Group();
    cameraRig.position.set(0, 0, 5);
    cameraRig.add(camera);

    scene.add(cameraRig);

    cameraControls = new CameraControls(camera, renderer.domElement);

    window.addEventListener("resize", () => resizer(camera, renderer));

    SceneSetUp(scene);

    controller1 = renderer.xr.getController(0);

    cameraRig.add(controller1);

    controller2 = renderer.xr.getController(1);

    cameraRig.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(
      controllerModelFactory.createControllerModel(controllerGrip1)
    );
    cameraRig.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
      controllerModelFactory.createControllerModel(controllerGrip2)
    );
    cameraRig.add(controllerGrip2);

    //

    // let destMarker = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial({ wireframe: true }));
    // scene.add(destMarker)
    //object3d 로 일단 가자 , class 화는 너무 가는듯. ...

    let destMarker = new THREE.Group();
    scene.add(destMarker);

    // Loader("model/opaDog.gltf", destMarker)
    Loader("model/opaDuck.gltf", destMarker);
    // Loader("model/duck.gltf", destMarker)

    // 후처리 코드 ...
    // Loader("model/LittlestTokyo.glb", scene, (obj) => {
    //   obj.position.set(0, 200, -300);
    // //   obj.scale.set(0.1,0.1,0.1)
    // });
    // scene.add(box)

    // Loader("model/farm.gltf", scene, (obj) => {
    //     obj.scale.set(10,10,10)
    //     obj.position.set(0, 0, -10);
    //   //   obj.scale.set(0.1,0.1,0.1)
    //   });

    Loader("model/house.gltf", scene, (obj) => {
      obj.scale.set(15, 15, 15);
      obj.position.set(0, 0, -10);
      //   obj.scale.set(0.1,0.1,0.1)
    });

    // scene.add(deltaLine)
    // scene.add(deltaLine2);

    spatialControls = new SpatialControls(
      renderer.xr,
      cameraRig,
      controller1,
      controller2,
      destMarker,
      true,
      scene
    );


    console.log(navigator)
  }

  function Animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    //    if(bool){

    spatialControls.update();
    //    }

    renderer.render(scene, camera);
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowX: "hidden",
        overflowY: "hidden",
      }}
      ref={containerRef}
    >
      <button
        style={{
          position: "absolute",
        }}
        onClick={boolChange}
      >
        Move
      </button>
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}

function boolChange() {
  bool = true;
}
