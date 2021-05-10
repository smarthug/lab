import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import TWEEN from 'tween.js'
// import InfiniteGridHelper from './InfiniteGridHelper'

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
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
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
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


        const size = 1000;
        const divisions = 1000;

        const gridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);

        {
            const color = 0xFFFFFF;  // 하양
            const near = 10;
            const far = 100;
            scene.fog = new THREE.Fog(color, near, far);
        }




        // Skybox

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        const rgbeLoader = new RGBELoader();
        rgbeLoader.setDataType(THREE.UnsignedByteType);
        rgbeLoader.load('media/textures/skybox.hdr', (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.background = envMap;
            //scene.environment = envMap;
        });

        // scene.add(InfiniteGridHelper)


        console.log(TWEEN)

        new TWEEN.Tween(cube.position) // Create a new tween that modifies 'coords'.
            .to(new THREE.Vector3(10, 10, 10), 1000)
            .start() // Start the tween immediately.
    }

    function Animate() {
        requestAnimationFrame(Animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        TWEEN.update()

        renderer.render(scene, camera);
    }

    return <div ref={containerRef}>
        <canvas ref={canvasRef} />
        <div ref={vrButtonConRef}></div>
    </div>;
}