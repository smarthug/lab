import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
const loader = new GLTFLoader();

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

let miniPlayer = new THREE.Mesh(new THREE.OctahedronGeometry(1,1), new THREE.MeshNormalMaterial({wireframe:true}));
//var geometry = new THREE.BoxGeometry(1, 1, 1);
//var material = new THREE.MeshNormalMaterial();
//cube = new THREE.Mesh(geometry, material);

let tmpVector3 = new THREE.Vector3();

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
        scene.background = new THREE.Color("skyblue")
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
        renderer.shadowMap.enabled = true;


        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);




        let light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);

        // White directional light at half intensity shining from the top.
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);


        let hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        scene.add(hemiLight);


        light = new THREE.SpotLight(0xffa95c, 4);
        light.position.set(-50, 350, 50);
        light.castShadow = true;
        scene.add(light);

        //Test();
        //'model/space_battle_cruiser/scene.gltf',
        // Load a glTF resource
        loader.load(
            'model/bronze_replica_statue_of_liberty/scene.gltf',
            (gltf) => {



                gltf.scene.traverse(n => {
                    if (n.isMesh) {
                        n.castShadow = true;
                        n.receiveShadow = true;
                        if (n.material.map) n.material.map.anisotropy = 16;
                    }
                });
                console.log(gltf)
                scene.add(gltf.scene);


                let miniWorld = scene.clone();

                scene.add(miniWorld)
                miniWorld.position.set(0, 0, -0.3)
                miniWorld.scale.set(0.005, 0.005, 0.005)
                miniWorld.add(miniPlayer)
                // miniWorld.renderOrder = 999;
                camera.add(miniWorld)
                scene.renderOrder = 999;
                scene.add(camera)

                //gltf.animations; // Array<THREE.AnimationClip>
                //gltf.scene; // THREE.Group
                //gltf.scenes; // Array<THREE.Group>
                //gltf.cameras; // Array<THREE.Camera>
                //gltf.asset; // Object

            },
            // called while loading is progressing
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            }
        );
    }

    function Animate() {
        requestAnimationFrame(Animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        // update miniplayer's position based on camera * miniScalar

        //miniPlayer.position.set(/)/
        tmpVector3.copy(camera.position);
        miniPlayer.position.copy(tmpVector3)
        renderer.render(scene, camera);
    }

    return <div ref={containerRef}>
        <canvas ref={canvasRef} />
        <div ref={vrButtonConRef}></div>
    </div>;
}



