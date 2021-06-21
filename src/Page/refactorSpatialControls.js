import React, { useEffect, useRef } from "react";

import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

import { resizer, SceneSetUp } from "../Utils/utils";
import Loader from "../Utils/loader";

// import SpatialControls from 'three-spatial-controls'
import SpatialControls from '../Utils/refactoredSpatialControls'
// import SpatialControls from "../Utils/JoystickSpatialControls";


// import { InteractiveGroup } from './testGroup'
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'
// import { HTMLMesh } from './testHTML'
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
    multiplyScalar: 3
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

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        renderer.xr.setFramebufferScaleFactor(2.0);
        renderer.setAnimationLoop(Animate);
        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));


        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        let cameraRig = new THREE.Group();
        let controller0 = renderer.xr.getController(0);
        let controller1 = renderer.xr.getController(1);

        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 5)]);

        controller0.add(new THREE.Line(geometry));
        controller1.add(new THREE.Line(geometry));


        scene.add(cameraRig);
        cameraRig.add(camera);
        cameraRig.add(controller0);
        cameraRig.add(controller1);


        // cameraRig.position.set(0, 0, 5);
        SceneSetUp(scene);
        window.addEventListener("resize", () => resizer(camera, renderer));

        const controllerModelFactory = new XRControllerModelFactory();

        let controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(
            controllerModelFactory.createControllerModel(controllerGrip1)
        );

        let controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(
            controllerModelFactory.createControllerModel(controllerGrip2)
        );

        cameraRig.add(controllerGrip1);
        cameraRig.add(controllerGrip2);

        let destMarker = new THREE.Group();
        scene.add(destMarker);

        Loader("model/opaDuck.gltf", destMarker);
        // Loader("model/scene.gltf", destMarker);

        Loader("model/house.gltf", scene, (obj) => {
            obj.scale.set(15, 15, 15);
            obj.position.set(0, 0, -10);
        });


        const loader = new THREE.FontLoader();

        let playerHandHelper = new THREE.Group();
        let destHandHelper = new THREE.Group();

        loader.load("fonts/helvetiker_regular.typeface.json", (font) => {
            const geometry = new THREE.TextGeometry("From", {
                font: font,
                size: 0.05,
                height: 0.05,
            });

            playerHandHelper.add(
                new THREE.Mesh(geometry, new THREE.MeshNormalMaterial())
            );

            const geometry2 = new THREE.TextGeometry("To", {
                font: font,
                size: 0.05,
                height: 0.05,
            });

            destHandHelper.add(
                new THREE.Mesh(geometry2, new THREE.MeshNormalMaterial())
            );
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
        gui.add(parameters, "multiplyScalar", 1, 100, 1).onChange(setTeleportDistance)
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
            {
                destMarker: destMarker,
                rightHanded: true,
                playerHandHelper: playerHandHelper,
                destHandHelper: destHandHelper,
                multiplyScalar: 1
            }
        );

        function setTeleportDistance(value) {
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