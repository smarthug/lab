import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

import InfiniteGridHelper from './InfiniteGridHelper'


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

        const background = new THREE.CubeTextureLoader()
            .setPath('textures/cube/MilkyWay/')
            .load(['dark-s_px.jpg', 'dark-s_nx.jpg', 'dark-s_py.jpg', 'dark-s_ny.jpg', 'dark-s_pz.jpg', 'dark-s_nz.jpg']);


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

        const grid = new InfiniteGridHelper(10, 100);

        scene.add(grid)
    }

    function Animate() {
        requestAnimationFrame(Animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        renderer.render(scene, camera);
    }

    return <div ref={containerRef}>
        <canvas ref={canvasRef} />
        <div ref={vrButtonConRef}></div>
    </div>;
}