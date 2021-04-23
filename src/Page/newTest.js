import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

import * as dat from 'dat.gui'

import { HTMLMesh } from './three.html'

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

CameraControls.install({ THREE: THREE });

let xrReferenceSpace = null;

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
let cube, scene, camera, renderer, cameraControls;
var controller1, controller2;
let controllerGrip1, controllerGrip2;
const clock = new THREE.Clock();

const controllerObj = {
    width: 999,
    bool: true,
    clicktest: () => { console.log("test") }
}



export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const datConRef = useRef();
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
        // renderer.background = "white"
        renderer.xr.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.setFramebufferScaleFactor(2.0);


        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        //scene.add(cube);
        camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);


        const gui = new dat.GUI({ autoPlace: false });
        gui.add(controllerObj, "width")
        gui.add(controllerObj, "bool")
        gui.add(controllerObj, "clicktest")
        console.log(gui)

        datConRef.current.append(gui.domElement)

        let htmlMesh = new HTMLMesh(datConRef.current.childNodes[0]);
        htmlMesh.position.set(1, 1.5, - 0.5);
        htmlMesh.rotation.y = - 0.5;
        scene.add(htmlMesh)

        const light = new THREE.AmbientLight(0x404040); // soft white light
        // scene.add(light);


        scene.background = new THREE.Color("skyblue");

        vrButtonConRef.current.append(VRButton.createButton(renderer))



        


        // scene.background.

        controller1 = renderer.xr.getController(0);
        // controller1.addEventListener('selectstart', onSelectStart);
        // controller1.addEventListener('selectend', onSelectEnd);
        controller1.addEventListener('select', onSelect);

        // controller1.addEventListener('squeezestart', onLeftSqueezeStart);
        // controller1.addEventListener('squeezeEnd', onMove);
        // controller1.addEventListener('squeeze', onMove);
        scene.add(controller1);

        controller2 = renderer.xr.getController(1);
        controller2.addEventListener('selectstart', onSelect);
        // controller2.addEventListener('selectend', onSelectEnd);

        // controller2.addEventListener('squeezestart', onRightSqueezeStart);
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



    }

    function Animate() {

        renderer.setAnimationLoop(render);

    }

    function render() {
        // requestAnimationFrame(Animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        renderer.render(scene, camera);
    }

    return <div ref={containerRef}>
        <div ref={vrButtonConRef}></div>
        <div ref={datConRef}></div>
        <canvas ref={canvasRef} />
    </div>;
}


function onSelect( event ) {

    console.log("select!!")

    // console.log(renderer.xr.getReferenceSpace())


    // let result = renderer.xr.getReferenceSpace().getOffsetReferenceSpace(
    //     new window.XRRigidTransform({x:0, y:0, z:10.0}, {x:0, y:0, z:1.0, w: 1.0}));


    //     console.log(result)


        renderer.xr.getSession().requestReferenceSpace("local")
        .then((refSpace) => {
          xrReferenceSpace = refSpace;
          xrReferenceSpace = xrReferenceSpace.getOffsetReferenceSpace(
                new window.XRRigidTransform({x:0, y:0, z:10.0}, {x:0, y:0, z:1.0, w: 1.0}));
        //   xrSession.requestAnimationFrame(drawFrame);
        });

    // const controller = event.target;

    // const intersections = getIntersections( controller );
    // console.log(intersections)

    // if ( intersections.length > 0 ) {

    //     const intersection = intersections[ 0 ];

    //     const object = intersection.object;
    //     const uv = intersection.uv;

    //     object.material.map.click( uv.x, 1 - uv.y );

    // }

}


function getIntersections( controller ) {

    console.log("raycasted!")

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );
    console.log(scene)

    return raycaster.intersectObjects( scene.children );

}