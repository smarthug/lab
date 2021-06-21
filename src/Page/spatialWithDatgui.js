import React, { useEffect, useRef } from "react";

import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

import { resizer, SceneSetUp } from "../Utils/utils";
import Loader from "../Utils/loader";

// import SpatialControls from "../Utils/JoystickSpatialControls";
import SpatialControls from "../Utils/methodSpatialControls";

import { InteractiveGroup } from './testGroup'
// import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup'
// import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'
import { HTMLMesh } from './testHTML'
import { GUI } from 'dat.gui'

let scene, camera, renderer
let spatialControls;


const parameters = {
    radius: 0.5,
    tube: 0.2,
    tubularSegments: 150,
    radialSegments: 20,
    p: 2,
    q: 3,
    multiplyScalar : 3
};

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();

    useEffect(() => {
        Init();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function Init() {
        scene = new THREE.Scene();
        SceneSetUp(scene);

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
        renderer.setAnimationLoop(Animate);

        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

        window.addEventListener("resize", () => resizer(camera, renderer));

        let cameraRig = new THREE.Group();
        cameraRig.position.set(0, 0, 5);
        cameraRig.add(camera);
        scene.add(cameraRig);

        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 5)]);

        let controller0 = renderer.xr.getController(0);
        controller0.add(new THREE.Line(geometry));
        cameraRig.add(controller0);

        let controller1 = renderer.xr.getController(1);
        controller1.add(new THREE.Line(geometry));
        cameraRig.add(controller1);

        const controllerModelFactory = new XRControllerModelFactory();

        let controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(
            controllerModelFactory.createControllerModel(controllerGrip1)
        );
        cameraRig.add(controllerGrip1);

        let controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(
            controllerModelFactory.createControllerModel(controllerGrip2)
        );
        cameraRig.add(controllerGrip2);

        let destMarker = new THREE.Group();
        scene.add(destMarker);

        Loader("model/opaDuck.gltf", destMarker);
        // Loader("model/scene.gltf", destMarker);

        Loader("model/house.gltf", scene, (obj) => {
            obj.scale.set(15, 15, 15);
            obj.position.set(0, 0, -10);
        });


        function onChange() {

        }

        

        const gui = new GUI({ width: 300 });
        gui.add(parameters, 'radius', 0.0, 1.0).onChange(onChange);
        gui.add(parameters, 'tube', 0.0, 1.0).onChange(onChange);
        gui.add(parameters, 'tubularSegments', 10, 150, 1).onChange(onChange);
        gui.add(parameters, 'radialSegments', 2, 20, 1).onChange(onChange);
        gui.add(parameters, 'p', 1, 10, 1).onChange(onChange);
        gui.add(parameters, 'q', 0, 10, 1).onChange(onChange);
        gui.add(parameters, "multiplyScalar", 1,100,1).onChange(setTeleportDistance)
        // gui.add(custom, 'hosuk')
        gui.domElement.style.visibility = 'hidden';
        // gui.domElement.style.opacity = '0.5';


        const group = new InteractiveGroup(renderer, camera);
        // scene.add(group);
        cameraRig.add(group);

        const mesh = new HTMLMesh(gui.domElement);
        mesh.position.x = - 0.75;
        mesh.position.y = 1.5;
        mesh.position.z = - 2.5;
        mesh.rotation.y = Math.PI / 4;
        mesh.scale.setScalar(8);
        group.add(mesh);

        spatialControls = new SpatialControls(
            renderer,
            cameraRig,
            controller0,
            controller1,
            destMarker,
            true,
        );


        function setTeleportDistance(value){
            console.log(value);
            spatialControls.setDistance(value);
        }
    }

    function Animate() {
        spatialControls.update();

        renderer.render(scene, camera);
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
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    );
}