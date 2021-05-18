import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";

import CameraControls from "camera-controls";

import InfiniteGridHelper from "./InfiniteGridHelper";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import nipplejs from 'nipplejs';


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

let cube, scene, camera, renderer, cameraControls;
let mixer;
const clock = new THREE.Clock();

let idleAction, walkAction, runAction;

let tree;

let player;

// var mx = new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0),moveVector,new THREE.Vector3(0,1,0));
// var qt = new THREE.Quaternion().setFromRotationMatrix(mx);
// player.setRotationFromQuaternion(qt);

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const [meter, setMeter] = useState(0);
    useEffect(() => {
        Init();
        Animate();


        var manager = nipplejs.create();

        manager.on("move", function (evt, data) {
            // Do something.
            // console.log(evt, data)
            console.log(data.vector)
            const { x, y } = data.vector;
            horizonAxis = -x;
            verticalAxis = y;

            runAction.play();
            idleAction.stop();
        })

        manager.on("end", function (evt, data) {
            // Do something.
            // console.log(evt, data)

            horizonAxis = 0;
            verticalAxis = 0;
            // idleAction.play();

            runAction.stop();
            idleAction.play();
        })
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
        camera.position.set(5, 10, 10);
        cameraControls = new CameraControls(camera, renderer.domElement);

        const grid = new InfiniteGridHelper(10, 100);

        scene.add(grid);

        LightSetUp();
        Loader();

        // cameraControls.moveTo(0,0,0, true);
        // cameraControls.setPosition(0,1,-3, true);
    }

    function Animate() {
        requestAnimationFrame(Animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);
        if (mixer) {
            mixer.update(delta);
        }

        // set add

        moveVector.set(
            camera.getWorldDirection(cameraVector).x,
            0,
            camera.getWorldDirection(cameraVector).z
        );

        rightCameraVector.copy(moveVector);

        // var axis = new THREE.Vector3(0, 1, 0);
        // var angle = Math.PI / 2;

        rightCameraVector.applyAxisAngle(upVec, Math.PI / 2);

        rightCameraVector.multiplyScalar(horizonAxis);

        moveVector.multiplyScalar(verticalAxis);

        //* verticalAxis
        //   console.log(moveVector);
        // unitMoveVector.copy(moveVector);
        unitMoveVector.addVectors(moveVector, rightCameraVector);

        unitMoveVector.normalize();

        // unitMoveVec 은 최종 합산될거로 쓰자 ...
        // unitMoveVector.multiplyScalar(verticalAxis);
        if (verticalAxis !== 0 || horizonAxis !== 0) {
            //   player.translateOnAxis(moveVector, delta*playerSpeed);
            unitMoveVector.multiplyScalar(delta).multiplyScalar(playerSpeed);
            player.position.add(unitMoveVector);

            tmpMatrix.lookAt(
                new THREE.Vector3(0, 0, 0),
                unitMoveVector,
                new THREE.Vector3(0, 1, 0)
            );
            tmpQuaternion.setFromRotationMatrix(tmpMatrix);
            player.setRotationFromQuaternion(tmpQuaternion);
            //   player.rotation.set(cameraVector)
            //   player.setRotationFromAxisAngle(moveVector,1)
            //   player.lookAt(moveVector)
            // console.log(player.rotation)
        }

        // translate on axis ...
        // Vector3 moveVector = (new Vector3(Camera.main.transform.right.x, 0, Camera.main.transform.right.z) * joystick.Horizontal + new Vector3(Camera.main.transform.forward.x, 0 , Camera.main.transform.forward.z) * joystick.Vertical).normalized;

        // moveVector.set(Camera.main.transform.forward.x, 0 , Camera.main.transform.forward.z) * joystick.Vertical)
        // moveVector.set(
        //   (camera.getWorldDirection(cameraVector).x, 0, camera.getWorldDirection(cameraVector).z) *
        //     verticalAxis
        // );
        // if (player) {
        //   player.translateOnAxis(moveVector, 2);
        // }
        renderer.render(scene, camera);
    }

    function handleClick() {
        // setMeter(RandomMover());

        // cameraControls.setPosition(0,1,-3, true);
        // cameraControls.setLookAt(1.5, 1.5, -3, 0, 1, 0, true);
        Mover();
    }

    return (
        <div ref={containerRef}>
            <h1 style={{ position: "absolute", left: "30px", color: "white" }}>
                {meter}m
      </h1>
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

        // this.setContent(scene, clips);

        // blobURLs.forEach(URL.revokeObjectURL);

        // See: https://github.com/google/draco/issues/349
        // DRACOLoader.releaseDecoderModule();

        // resolve(gltf);
        player = scene2;
        scene.add(player);
        // tree = scene2;
        // tree.scale.set(10, 10, 10);

        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer(player);

        idleAction = mixer.clipAction(animations[0]);
        walkAction = mixer.clipAction(animations[3]);
        runAction = mixer.clipAction(animations[1]);

        // runAction.play();
        idleAction.play();

        // cameraControls.setLookAt(1.5,1.5,-3, 0,1,0,true);

        // actions = [idleAction, walkAction, runAction];

        // activateAllActions();

        // animate();
        // Animate();
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
    console.log("wtf");

    //   var vector = new THREE.Vector3(1, 0, 0);
    console.log(cameraVector);
    rightCameraVector.copy(cameraVector);

    var axis = new THREE.Vector3(0, 1, 0);
    var angle = Math.PI / 2;

    rightCameraVector.applyAxisAngle(axis, angle);

    console.log(rightCameraVector);

    //   console.log(cameraVector);
    //   rightCameraVector.cross(cameraVector);

    //   console.log(rightCameraVector);
}

// function isInputEvent( event ) {

// 	const target = event.target;

// 	return (
// 		target.tagName === 'INPUT' ||
// 		target.tagName === 'SELECT' ||
// 		target.tagName === 'TEXTAREA' ||
// 		target.isContentEditable
// 	);

// }

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