import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls, helper;
const clock = new THREE.Clock();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var onDownPosition = new THREE.Vector2();
var onUpPosition = new THREE.Vector2();

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

        var geometry = new THREE.BoxGeometry(10, 10, 10);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);

        renderer.domElement.addEventListener('mousedown', onMouseDown, false);


        const geometryHelper = new THREE.ConeGeometry(1, 4, 3);
        geometryHelper.translate(0, 2, 0);
        geometryHelper.rotateX(Math.PI / 2);
        helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
        scene.add(helper);
    }

    function Animate() {
        requestAnimationFrame(Animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;

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



function handleClick() {
    console.log(onDownPosition.distanceTo(onUpPosition))
    if (onDownPosition.distanceTo(onUpPosition) === 0) {


        // var intersects = getIntersects( onUpPosition, objects );
        var intersects = getIntersects(onUpPosition, scene.children);

        if (intersects.length > 0) {

            var object = intersects[0].object;

            if (object.userData.object !== undefined) {

                // helper

                // editor.select( object.userData.object );

            } else {

                // editor.select( object );
                console.log("worked")

                helper.position.set(0, 0, 0);
                console.log(intersects[0])
                helper.lookAt(intersects[0].face.normal);

                helper.position.copy(intersects[0].point);

            }

        } else {

            // editor.select( null );

        }

        // render();

    }

}


// function movePin() {
//     helper.position.set(0, 0, 0);
//     helper.lookAt(intersects[0].face.normal);

//     helper.position.copy(intersects[0].point);
// }


// object picking




function getIntersects(point, objects) {

    mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);

    raycaster.setFromCamera(mouse, camera);

    return raycaster.intersectObjects(objects);

}