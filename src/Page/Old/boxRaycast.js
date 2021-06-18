import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls, helper, boxHelper;
const clock = new THREE.Clock();

const target = new THREE.Vector3();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var onDownPosition = new THREE.Vector2();
var onUpPosition = new THREE.Vector2();

var boxes = [];

export default function Main() {
    const containerRef = useRef();
    useEffect(() => {
        ThreeInit();
        LabInit();
        Animate();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function ThreeInit() {
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



        camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);

        renderer.domElement.addEventListener('mousedown', onMouseDown, false);



    }

    function LabInit() {
        let group = new THREE.Group();
        var geometry = new THREE.BoxGeometry(7, 3, 3);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        cube.rotateY(90)
        scene.add(cube);

        // let box = 
        //mesh world matrix test ... 

        // let box = new THREE.Box3().setFromObject(cube)
        let box = new THREE.Box3().setFromObject(cube)
        console.log(cube.matrixWorld);
        // box.applyMatrix4(cube.matrixWorld)

        // boxHelper = new THREE.BoxHelper(cube)

        boxHelper = new THREE.Box3Helper(box)

        boxes.push(box)


        scene.add(boxHelper)
    }

    function Animate() {
        requestAnimationFrame(Animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        // boxHelper.update();

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        renderer.render(scene, camera);
    }

    return <div ref={containerRef}></div>;
}



function getMousePosition(dom, x, y) {

    var rect = dom.getBoundingClientRect();
    return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

}



function onMouseDown(event) {

    // event.preventDefault();

    var array = getMousePosition(renderer.domElement, event.clientX, event.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('mouseup', onMouseUp, false);

}

function onMouseUp(event) {

    var array = getMousePosition(renderer.domElement, event.clientX, event.clientY);
    onUpPosition.fromArray(array);

    handleClick();

    document.removeEventListener('mouseup', onMouseUp, false);

}


function ascSort(a, b) {

    return a.distance - b.distance;

}



function getIntersectBox() {
    let intersects = [];

    boxes.map((box, i) => {

        //여기서 check ???

        let intersectedPoint = raycaster.ray.intersectBox(box, target);

        if (intersectedPoint) {

            // console.log(raycaster.ray.origin.distanceTo(intersectedPoint));
            let distance = raycaster.ray.origin.distanceTo(intersectedPoint);
            intersects.push({ distance: distance, box: box })
        }
    })

    intersects.sort(ascSort);

    // return intersects[0];
    return intersects;

}


function handleClick() {
    console.log(onDownPosition.distanceTo(onUpPosition))
    if (onDownPosition.distanceTo(onUpPosition) === 0) {



        mouse.set((onUpPosition.x * 2) - 1, - (onUpPosition.y * 2) + 1);

        raycaster.setFromCamera(mouse, camera);



        let result = getIntersectBox();

        console.log(result);



    }

}


