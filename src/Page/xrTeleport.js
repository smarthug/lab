import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { resizer, SceneSetUp } from '../Utils/utils'

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

let cameraRig

var controller1, controller2;
let controllerGrip1, controllerGrip2;

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

        SceneSetUp(scene)




        // controllers
        function onSelectStart() {

            this.userData.isSelecting = true;
            console.log(this)



        }

        function onSelectEnd() {

            this.userData.isSelecting = false;
            console.log(this);
            console.log('selectEnd!')
            handleMove();

            // Test();

            // Test 함수 의 호출을 여기서 ... 
        }

        function onMove() {
            console.log('moved')
        }

        function onLeftSqueezeStart() {
            // controlledObj.multipliedScalar++
            // console.log(controlledObj.multipliedScalar)
        }

        function onRightSqueezeStart() {
            // controlledObj.multipliedScalar--
            // console.log(controlledObj.multipliedScalar)
        }

        controller1 = renderer.xr.getController(0);
        controller1.addEventListener('selectstart', onSelectStart);
        controller1.addEventListener('selectend', onSelectEnd);
        controller1.addEventListener('select', onMove);

        controller1.addEventListener('squeezestart', onLeftSqueezeStart);
        scene.add(controller1);

        controller2 = renderer.xr.getController(1);
        controller2.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectend', onSelectEnd);

        controller2.addEventListener('squeezestart', onRightSqueezeStart);
        scene.add(controller2);



        const controllerModelFactory = new XRControllerModelFactory();

        controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        scene.add(controllerGrip1);

        controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        scene.add(controllerGrip2);

        //
    }

    function Animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        renderer.render(scene, camera);
    }

    function handleMove() {
        console.log("moved");

        cameraRig.position.add(new THREE.Vector3(0, 0, 5));

        console.log(camera)

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
                    position: "absolute"
                }}
                onClick={handleMove}
            >
                Move
            </button>
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    );
}
