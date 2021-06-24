import * as THREE from "three";
import React, { useEffect, useLayoutEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { resizer, SceneSetUp } from '../Utils/utils'

import { InteractiveGroup } from './testGroup'
// import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup'
// import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'
import { HTMLMesh } from './testHTML'
import { GUI } from 'dat.gui'

import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

import { Slider, Button } from '@material-ui/core'

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();


const parameters = {
    radius: 0.5,
    tube: 0.2,
    tubularSegments: 150,
    radialSegments: 20,
    p: 2,
    q: 3
};

const custom = {
    hosuk: (e) => console.log(e)
}

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const testRef = useRef();
    const buttonRef = useRef();

    useLayoutEffect(() => {
        Init();
        // Animate();

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


        //

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 5)]);

        const controller1 = renderer.xr.getController(0);
        controller1.add(new THREE.Line(lineGeometry));
        scene.add(controller1);

        const controller2 = renderer.xr.getController(1);
        controller2.add(new THREE.Line(lineGeometry));
        scene.add(controller2);

        //

        const controllerModelFactory = new XRControllerModelFactory();

        const controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        scene.add(controllerGrip1);

        const controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        scene.add(controllerGrip2);

        function onChange() {

        }



        const gui = new GUI({ width: 300 });
        gui.add(parameters, 'radius', 0.0, 1.0).onChange(onChange);
        gui.add(parameters, 'tube', 0.0, 1.0).onChange(onChange);
        gui.add(parameters, 'tubularSegments', 10, 150, 1).onChange(onChange);
        gui.add(parameters, 'radialSegments', 2, 20, 1).onChange(onChange);
        gui.add(parameters, 'p', 1, 10, 1).onChange(onChange);
        gui.add(parameters, 'q', 0, 10, 1).onChange(onChange);
        gui.add(custom, 'hosuk')
        gui.domElement.style.visibility = 'hidden';

        const group = new InteractiveGroup(renderer, camera);
        scene.add(group);

        var button = document.createElement('button');
        button.innerHTML = 'click me';
        button.onclick = function (e) {
            console.log(e); return false;
        };

        testRef.current.appendChild(button)

        // const mesh = new HTMLMesh(gui.domElement);
        const mesh = new HTMLMesh(testRef.current);
        mesh.position.x = - 0.75;
        mesh.position.y = 1.5;
        mesh.position.z = - 0.5;
        mesh.rotation.y = Math.PI / 4;
        mesh.scale.setScalar(8);
        group.add(mesh);
        // scene.add(mesh);

        // buttonRef.current.addEventListener("click", (e) => {
        //     console.log("clicked test");
        //     console.log(e)
        //     // 역시 예측한대로 bubbles 가 false 임 ...
        //     // react events 는 버블링에 의존적 ... 
        //     // buttonRef.current.click();
        // })
        // console.log(buttonRef.current)
        // buttonRef.current.click();
        // buttonRef.current.dispatchEvent( new MouseEvent( event, mouseEventInit ) );
        // buttonRef.current.dispatchEvent( new MouseEvent( "click", {bubbles:true} ) );
    }

    function Animate() {


        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        renderer.render(scene, camera);
    }
    const handleClick = (e) => {
        console.log(e)
        // console.log("infinite?")
        // e.nativeEvent.stopPropagation();
        // e.nativeEvent.preventDefault();
        // e.nativeEvent.stopImmediatePropagation();
        // Event.stopImmediatePropagation()

        // document.getElementById("VRButton").click();
    }
    return (
        <div style={{
            height: "100vh",
            overflowX: "hidden",
            overflowY: "hidden",
        }}
            ref={containerRef}
        >   
        <div ref={testRef} style={{position:"absolute"}}>
            <button onClick={handleClick}>TEST</button>
            <Button disableRipple={true} onClick={handleClick}  color="secondary" variant="outlined">XR</Button>
        </div>
            
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    );
}


