import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

import GameScene from '../Actors/GameScene'
import { resizer, SceneSetUp } from '../Utils/utils'

import { useStore } from '../Utils/store'
import {JoystickInit} from '../Utils/joyStick'
import Player from "../Actors/Player";

CameraControls.install({ THREE: THREE });

let scene, camera, renderer, cameraControls;

const clock = new THREE.Clock();



export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const joystickConRef = useRef();

    const set = useStore(state => state.set)

    useEffect(() => {
        Init();
        Animate();
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

        scene.add(new Player());
        scene.beginPlay();


        JoystickInit(joystickConRef, set);
    }

    function Animate() {
        requestAnimationFrame(Animate);
        const delta = clock.getDelta();
        cameraControls.update(delta);
      




        scene.tick(camera,delta);
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


