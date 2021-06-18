import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { resizer, SceneSetUp } from '../Utils/utils'

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

        new Promise((resolve) =>{

            resolve();
        }).then(()=>{

            return TakesTimeFunction()
        }).then((value)=>{
            console.log("what I wanted");
            console.log(value);
        })



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

    return (
        <div style={{
            height: "100vh",
            overflowX: "hidden",
            overflowY: "hidden",
        }}
            ref={containerRef}
        >
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    );
}



function TakesTimeFunction(){

    return new Promise(resolve => {

        setTimeout(()=>{
            console.log("free");
            resolve("test");
        })
    })
}

// async await 이 맞나 ???
// async await 말고는 방법이 없나 ....


// return new Promise(resolve => {
//     // worker post message ... 
//     // async await ??
// })

//async await 안쓰면 promise 안에 promise 로 해결가능하지 않을까 ???
