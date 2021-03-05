import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer, CENTER } from 'three-mesh-bvh';


// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls, boxHelper;
const clock = new THREE.Clock();

const target = new THREE.Vector3();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var onDownPosition = new THREE.Vector2();
var onUpPosition = new THREE.Vector2();

var boxes = [];


const params = {
	raycasters: {
		count: 150,
		speed: 1
	},

	mesh: {
		splitStrategy: CENTER,
		lazyGeneration: true,
		count: 1,
		useBoundsTree: true,
		visualizeBounds: false,
		speed: 1,
		visualBoundsDepth: 10
	}
};

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
        // var geometry = new THREE.BoxGeometry(7, 3, 3);
        var material = new THREE.MeshNormalMaterial();
        // cube = new THREE.Mesh(geometry, material);
        // scene.add(cube);

        // Generate geometry and associated BVH
        const geom = new THREE.TorusKnotBufferGeometry(10, 3, 400, 100);
        const mesh = new THREE.Mesh(geom, material);
        // geom.computeBoundsTree();

        geom.computeBoundsTree( { strategy: params.mesh.splitStrategy, lazyGeneration: params.mesh.lazyGeneration } );
		geom.boundsTree.splitStrategy = params.mesh.splitStrategy;

        scene.add(mesh)
        console.log(mesh)

        let vis2 = new MeshBVHVisualizer(mesh);
        // vis2.depth= 4
        // vis2.update();
        scene.add(vis2)


        // const geometry2 = new THREE.TorusBufferGeometry(10, 3, 16, 100);
        // // const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00,  });
        // const torus2 = new THREE.Mesh(geometry2, material);
        // geometry2.computeBoundsTree();
        // torus2.translateX(-40)
        // scene.add(torus2);

        // let vis = new MeshBVHVisualizer(torus2, 50);
        // vis.update();
        // scene.add(vis)
    }

    function Animate() {
        requestAnimationFrame(Animate);

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


        // 여기서 bvh 세팅을 해야하지 않을까 ??
        // let result = getIntersectBox();

        raycaster.firstHitOnly = true;
        let result = raycaster.intersectObjects(scene.children);

        console.log(result);



    }

}


