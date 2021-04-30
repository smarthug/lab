import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

let testArr = []

export default function Main() {
    const containerRef = useRef();
    useEffect(() => {
        Init();
        Animate();

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
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        camera.position.z = 50;

        // let geometry2 = new THREE.TorusKnotGeometry(60, 40, 5000, 2000);
        // let material2 = new THREE.MeshNormalMaterial({ color: 0xffff00 });
        // let torusKnot2 = new THREE.Mesh(geometry2, material2);
        // scene.add(torusKnot2);

        let group = new THREE.Group();
        // group.add(cube);
        testArr.push(cube);


        cameraControls = new CameraControls(camera, renderer.domElement);
    }

    function Animate() {
        requestAnimationFrame(Animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        const hasControlsUpdated = cameraControls.update(delta);
        // cameraControls.update(delta);

        if (hasControlsUpdated) {


            renderer.render(scene, camera);
        }
    }


    function clearThree(mesh = scene) {
        //console.log(scene.children.filter(({ type }) => type === "Mesh"));

        function disposeGeo(item) {
            while (item.children.length > 0) {
                disposeGeo(item.children[0]);
                item.remove(item.children[0]);
            }
            if (item.geometry) {
                item.geometry.dispose();
                item.material.dispose();
            }
        }

        if (mesh.children.length === 0) {
            return;
        }
        disposeGeo(mesh);
        mesh.children = [];

        renderer.renderLists.dispose();
    }

    function Check(){
        console.log(testArr)
        console.log(renderer)
        console.log(renderer.renderLists)

        scene.add(testArr[0])
    }

    return <div>
        <button onClick={() => clearThree()} >dispose</button>
        <button onClick={Check} >check</button>
        <div ref={containerRef}></div></div>;
}

// 일단은 no dat gui 로 가자 ... 