import * as THREE from "three";
import React, {  useEffect, useRef } from "react";

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
const loader = new GLTFLoader();

var camera, scene, renderer;
var controller1, controller2;
let controllerGrip1, controllerGrip2;

let player, destination;

var room;

let playerPos = new THREE.Vector3();
let destinationPos = new THREE.Vector3();
// let cubePos = new THREE.Vector3();

let result = new THREE.Vector3();

let tmp = new THREE.Vector3();
let tmpQuaternion = new THREE.Quaternion();


let tmpVector3 = new THREE.Vector3();


let cube, box

const controlledObj = {
    multipliedScalar: 3,
    teleport: () => { }

}

let miniPlayer = new THREE.Mesh(new THREE.OctahedronGeometry(1,1), new THREE.MeshNormalMaterial({wireframe:true}));

// var count = 0, amount = 1000;
// var instancedMesh, objects = [];

// var clock = new THREE.Clock();
// let  scene, camera, renderer;
// const clock = new THREE.Clock();



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


let ship;


export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();

    useEffect(() => {
        init();
        animate();

            //eslint-disable-next-line
    }, []);

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x404040);
        // scene.fog = new THREE.Fog(scene.background, 10, 15);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1,
            1.7976931348623157e8);
        camera.position.set(0, 1.6, 0);

        var color = new THREE.Color(0x505050);
        room = new THREE.GridHelper(20, 40, color, color);
        room.geometry.translate(0, -0.01, 0); // fix z-fighting
        scene.add(room);

        scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        scene.add(light);

        let amLight = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(amLight);

        // White directional light at half intensity shining from the top.
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);


        let hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        scene.add(hemiLight);


        let spotLight = new THREE.SpotLight(0xffa95c, 4);
        spotLight.position.set(-50, 350, 50);
        spotLight.castShadow = true;
        scene.add(spotLight);

        // renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
        renderer.xr.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.setFramebufferScaleFactor(2.0);
        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

        // controllers
        function onSelectStart() {

            this.userData.isSelecting = true;
            console.log(this)



        }

        function onSelectEnd() {

            this.userData.isSelecting = false;
            console.log(this)

            Test();

            // Test 함수 의 호출을 여기서 ... 
        }

        function onMove() {
            console.log('moved')
        }

        function onLeftSqueezeStart(){
            controlledObj.multipliedScalar++
            console.log(controlledObj.multipliedScalar)
        }

        function onRightSqueezeStart(){
            controlledObj.multipliedScalar--
            console.log(controlledObj.multipliedScalar)
        }

        controller1 = renderer.xr.getController(0);
        controller1.addEventListener('selectstart', onSelectStart);
        controller1.addEventListener('selectend', onSelectEnd);
        controller1.addEventListener('select', onMove);

        controller1.addEventListener('squeezestart', onLeftSqueezeStart);
        // controller1.addEventListener('squeezeEnd', onMove);
        // controller1.addEventListener('squeeze', onMove);
        scene.add(controller1);

        controller2 = renderer.xr.getController(1);
        controller2.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectend', onSelectEnd);

        controller2.addEventListener('squeezestart', onRightSqueezeStart);
        // controller2.addEventListener('squeezeEnd', onMove);
        // controller2.addEventListener('squeeze', onMove);
        scene.add(controller2);



        const controllerModelFactory = new XRControllerModelFactory();

        controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        scene.add(controllerGrip1);

        controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        scene.add(controllerGrip2);

        //

        window.addEventListener('resize', onWindowResize, false);

        player = new THREE.Mesh(new THREE.SphereBufferGeometry(0.05, 100, 100), new THREE.MeshStandardMaterial({ color: "green" }));
        player.position.set(0, 0.05, 0);
        // controllerGrip1.add(player)
        controller2.add(player)
        // scene.add(player);

        destination = new THREE.Mesh(new THREE.SphereBufferGeometry(0.05, 100, 100), new THREE.MeshStandardMaterial({ color: "yellow" }));
        destination.position.set(0, 0.05, 0);
        controller1.add(destination);



        scene.add(deltaLine)
        scene.add(deltaLine2)




        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        ship = cube
        scene.add(cube);


        var geometry2 = new THREE.BoxGeometry(1, 1, 1);
        var material2 = new THREE.MeshNormalMaterial({ wireframe: true });
        box = new THREE.Mesh(geometry2, material2);
        scene.add(box);




        // mini world 


         //Test();
        //'model/space_battle_cruiser/scene.gltf',
        // Load a glTF resource
        //aurora_space_battleship
        //bronze_replica_statue_of_liberty
        loader.load(
            'model/aurora_space_battleship/scene.gltf',
            (gltf) => {



                gltf.scene.traverse(n => {
                    if (n.isMesh) {
                        n.castShadow = true;
                        n.receiveShadow = true;
                        if (n.material.map) n.material.map.anisotropy = 16;
                    }
                });
                console.log(gltf)
                gltf.scene.position.set(0,0,-500)
                ship = gltf.scene
                scene.add(gltf.scene);


                let miniWorld = scene.clone();

                scene.add(miniWorld)
                miniWorld.position.set(0, 0.1,0)
                miniWorld.scale.set(0.002, 0.002, 0.002)
                miniWorld.add(miniPlayer)
                // miniWorld.renderOrder = 999;
                // camera.add(miniWorld)
                controller1.add(miniWorld);
                // controllerGrip1.add(miniWorld)
                scene.renderOrder = 999;
                // scene.add(camera)

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

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function handleController(controller) {

        if (controller.userData.isSelecting) {



        }

    }

    //

    function animate() {

        renderer.setAnimationLoop(render);

    }

    function render() {

        handleController(controller1);
        handleController(controller2);

        // var delta = clock.getDelta(); 

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        deltaLine.visible = true;
        // deltaLine2.visible = true
        player.getWorldPosition(playerPos)
        destination.getWorldPosition(destinationPos)

        tmp.subVectors(destinationPos, playerPos)

        tmp.multiplyScalar(controlledObj.multipliedScalar);
        // box.position.copy(tmp.add(cube.position))
        box.position.copy(tmp.add(ship.position))

        player.getWorldQuaternion(tmpQuaternion);

        deltaLine.position.copy(playerPos);
        tmp.set(1e-10, 1e-10, 1e-10).add(destinationPos).sub(playerPos);
        deltaLine.scale.copy(tmp);

        // deltaLine2.position.copy(cube.position);
        deltaLine2.position.copy(ship.position);
        // tmp.set(1e-10, 1e-10, 1e-10).add(cube.position).sub(box.position).multiplyScalar(- 1);
        tmp.set(1e-10, 1e-10, 1e-10).add(ship.position).sub(box.position).multiplyScalar(- 1);
        deltaLine2.scale.copy(tmp);



            //mini world
         //miniPlayer.position.set(/)/
         tmpVector3.copy(camera.position);
         miniPlayer.position.copy(tmpVector3)


        renderer.render(scene, camera);

    }


    function Test() {
        result = tmp.subVectors(destinationPos, playerPos)
        // cube.position.add(result.multiplyScalar(controlledObj.multipliedScalar));
        ship.position.add(result.multiplyScalar(controlledObj.multipliedScalar));
    }


    // function ThumbMove() {
    //     var handedness = "unknown";

    //     //determine if we are in an xr session
    //     const session = renderer.xr.getSession();
    //     let i = 0;

    //     if (session) {

    //         console.log(session.inputSources);
    //         // 그냥 squeeze 버튼으로 조정 ????
    //     }

    // }




    return (

        <div ref={containerRef}>
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    )
}






