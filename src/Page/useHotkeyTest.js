import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";

import CameraControls from "camera-controls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { resizer, SceneSetUp } from '../Utils/utils'

import { install, uninstall } from "@github/hotkey"

import { useHotkey } from '../Utils/useHotkey'

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();
let wm = new WeakMap();
let c = {};




export default function Main() {
    const [num, setNum] = useState(0)
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const numRef = useRef();
    const increaseRef = useRef();

    const setElement = useHotkey("z z z");
    useEffect(() => {
        Init();

        console.log("init")

        // install(increaseRef.current, 'a a')
        // setElement(increaseRef.current)

        return () => {
            console.log(`clean up final?`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {


        wm.set(numRef.current, num)
        // 똑같은거 두개가 가능할까 ???
        wm.set(numRef.current, num)
        // install(numRef.c)
        console.log(wm)


        // eslint-disable-next-line react-hooks/exhaustive-deps

        return () => {
            console.log(`clean up ${num}`)
        }
    }, [num]);

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
        camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);


        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

        renderer.setAnimationLoop(Animate);

        window.addEventListener("resize", () => resizer(camera, renderer));

        SceneSetUp(scene)
    }

    function Animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        renderer.render(scene, camera);
    }

    function handleClick() {
        const dat = num + 1;
        setNum(dat)
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
            <h1 style={{ position: "absolute", color: "white" }} ref={numRef}>{num}</h1>
            <button ref={setElement} onClick={handleClick}>IncreaseNum</button>
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    );
}


//ref={ref => install(ref,"t a")}


// state 와
// useEffect /???
// un mount 에서의 uninstall ... 
//테스트 가 필요 .... 

// function useHotkey() {
//     function setHotkeyElement(element) {
//         !!element && install(element);
//     }
//     return [shortcutMappingObj, setHotkeyElement];
// }
