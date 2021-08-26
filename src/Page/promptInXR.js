import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

import { resizer, SceneSetUp } from "../Utils/utils";

import { install } from "@github/hotkey";

import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();
  useEffect(() => {
    Init();
    // Animate();

    // Install all the hotkeys on the page
    for (const el of document.querySelectorAll("[data-hotkey]")) {
      install(el);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
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
    camera.position.z = 5;

    cameraControls = new CameraControls(camera, renderer.domElement);

    vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

    renderer.setAnimationLoop(Animate);

    window.addEventListener("resize", () => resizer(camera, renderer));



    const controller1 = renderer.xr.getController(0);
    controller1.addEventListener("selectstart", handleTest)
        // controller1.add(new THREE.Line(lineGeometry));
        scene.add(controller1);

        const controller2 = renderer.xr.getController(1);
        // controller2.add(new THREE.Line(lineGeometry));
        scene.add(controller2);

        //

        const controllerModelFactory = new XRControllerModelFactory();

        const controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        scene.add(controllerGrip1);

        const controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        scene.add(controllerGrip2);

    SceneSetUp(scene);
  }

  function Animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    renderer.render(scene, camera);
  }

  function handleTest(){
      console.log("test");

      prompt("test")
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
        <button onClick={handleTest} data-hotkey="t">TEST</button>
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}
