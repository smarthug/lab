import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import nipplejs from "nipplejs";

import GameScene from '../Actors/GameScene'
import { resizer, SceneSetUp } from '../Utils/utils'

import { useStore } from '../Utils/store'

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


// window.addEventListener("keydown", onKeyDown);
// window.addEventListener("keyup", onKeyUp);



let scene, camera, renderer, cameraControls;
let mixer = { update: () => { } };
const clock = new THREE.Clock();

export let idleAction = { play: () => { }, stop: () => { } };
export let walkAction = { play: () => { }, stop: () => { } };
export let runAction = { play: () => { }, stop: () => { } };

let player;

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const joystickConRef = useRef();

    useEffect(() => {
        Init();
        Animate();



        var manager = nipplejs.create({
            zone: joystickConRef.current,
            mode: 'semi',
            // position: { left: '5%', top: '90%' },
            // color: 'red'
        });

        manager.on("move", function (evt, data) {
            //   console.log(data.vector);
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

        useStore.subscribe(state => {
            console.log(state)
            if (state.horizonAxis === 0 && state.verticalAxis === 0) {
                console.log("stop!")
                runAction.stop();
                idleAction.play();
            }
        }, state => state.horizonAxis)



        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    function Init() {

        scene = new GameScene();

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
        });
        renderer.xr.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.setFramebufferScaleFactor(2.0);

        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        camera.position.set(5, 10, 10);
        cameraControls = new CameraControls(camera, renderer.domElement);

        window.addEventListener("resize", () => resizer(camera, renderer));

        SceneSetUp(scene)

        // 이걸 플레이어로 옮길수 있을까 ???
        Loader();

        // scene.add(new Enemy());


        scene.beginPlay();
    }

    function Animate() {
        const { controls } = useStore.getState()
        const { horizonAxis, verticalAxis } = controls;
        requestAnimationFrame(Animate);

        const delta = clock.getDelta();
        cameraControls.update(delta);



        mixer.update(delta);




        if (verticalAxis !== 0 || horizonAxis !== 0) {

            runAction.play();
            idleAction.stop();

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

            // if (verticalAxis !== 0 || horizonAxis !== 0) {
            unitMoveVector.multiplyScalar(delta).multiplyScalar(playerSpeed);
            player.position.add(unitMoveVector);

            tmpMatrix.lookAt(centerVec, unitMoveVector, upVec);

            tmpQuaternion.setFromRotationMatrix(tmpMatrix);
            player.setRotationFromQuaternion(tmpQuaternion);
        }





        renderer.render(scene, camera);
    }


    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                overflowX: "hidden",
                overflowY: "hidden",
            }}
            ref={containerRef}
        >
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

// 이걸 on up keyboard event 에서 ...
function shouldRunStop() {
    if (horizonAxis === 0 && verticalAxis === 0) {
        runAction.stop();
        idleAction.play();
    }
}