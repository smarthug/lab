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

let player, destination;

let playerPos = new THREE.Vector3();
let destinationPos = new THREE.Vector3();

let result = new THREE.Vector3();

let tmp = new THREE.Vector3();
let tmpQuaternion = new THREE.Quaternion();

let multipliedScalar = 3;


function TranslateHelperGeometry() {

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));

    return geometry;

}

const matHelper = new THREE.MeshBasicMaterial({
    depthTest: false,
    depthWrite: false,
    transparent: true,
    side: THREE.DoubleSide,
    fog: false,
    toneMapped: false
});


let deltaLine = new THREE.Line(TranslateHelperGeometry(), matHelper);
let deltaLine2 = new THREE.Line(TranslateHelperGeometry(), matHelper)

let box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial({ wireframe: true }));

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
            multipliedScalar--
        }

        function onRightSqueezeStart() {
            // controlledObj.multipliedScalar--
            // console.log(controlledObj.multipliedScalar)
            multipliedScalar++
        }

        controller1 = renderer.xr.getController(0);
        controller1.addEventListener('selectstart', onSelectStart);
        controller1.addEventListener('selectend', onSelectEnd);
        controller1.addEventListener('select', onMove);

        //cameraRig 방식 ... scene 을 camera Rig 로 교체 ... 
        controller1.addEventListener('squeezestart',onRightSqueezeStart );
        cameraRig.add(controller1);

        controller2 = renderer.xr.getController(1);
        controller2.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectend', onSelectEnd);

        controller2.addEventListener('squeezestart',onLeftSqueezeStart );
        cameraRig.add(controller2);



        const controllerModelFactory = new XRControllerModelFactory();

        controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        cameraRig.add(controllerGrip1);

        controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        cameraRig.add(controllerGrip2);

        //


        player = new THREE.Mesh(new THREE.SphereBufferGeometry(0.05, 100, 100), new THREE.MeshStandardMaterial({ color: "green" }));
        player.position.set(0, 0.05, 0);
        // controllerGrip1.add(player)
        controller2.add(player)
        // scene.add(player);

        destination = new THREE.Mesh(new THREE.SphereBufferGeometry(0.05, 100, 100), new THREE.MeshStandardMaterial({ color: "yellow" }));
        destination.position.set(0, 0.05, 0);
        controller1.add(destination);


        scene.add(box)

        scene.add(deltaLine)
        scene.add(deltaLine2);


    }

    function Animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        deltaLine.visible = true;
        // deltaLine2.visible = true
        player.getWorldPosition(playerPos)
        destination.getWorldPosition(destinationPos)

        tmp.subVectors(destinationPos, playerPos)

        tmp.multiplyScalar(multipliedScalar);
        box.position.copy(tmp.add(cameraRig.position))

        player.getWorldQuaternion(tmpQuaternion);

        deltaLine.position.copy(playerPos);
        tmp.set(1e-10, 1e-10, 1e-10).add(destinationPos).sub(playerPos);
        deltaLine.scale.copy(tmp);


        deltaLine2.position.copy(cameraRig.position);
        tmp.set(1e-10, 1e-10, 1e-10).add(cameraRig.position).sub(box.position).multiplyScalar(- 1);
        deltaLine2.scale.copy(tmp);







        renderer.render(scene, camera);
    }

    function handleMove() {
        console.log("moved");

        // cameraRig.position.add(new THREE.Vector3(0, 0, 5));

        console.log(camera)


        result = tmp.subVectors(destinationPos, playerPos)
        cameraRig.position.add(result.multiplyScalar(multipliedScalar));

        // cameraRig.lookAt(0,0,0)
        cameraRig.lookAt(0,cameraRig.position.y,0)

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
