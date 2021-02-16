import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

CameraControls.install({ THREE: THREE });

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;


let cube, scene, camera, renderer, cameraControls, helper;
const clock = new THREE.Clock();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const sphere = new THREE.SphereGeometry(0.25, 20, 20);
const cylinder = new THREE.CylinderGeometry(0.02, 0.02);
const pointDist = 25;


// reusable vectors
const origVec = new THREE.Vector3();
const dirVec = new THREE.Vector3();
const xDir = (Math.random() - 0.5);
const yDir = (Math.random() - 0.5);

// const origMesh = new THREE.Mesh(sphere, material);
//         const hitMesh = new THREE.Mesh(sphere, material);

let origMesh, hitMesh, cylinderMesh, obj;




export default function Main() {
    const containerRef = useRef();
    useEffect(() => {
        Init();
        Animate();
        window.addEventListener('mousemove', onMouseMove, false);
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
        geometry.computeBoundsTree();
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        
        scene.add(cube);
        camera.position.z = 200;

        const geometryHelper = new THREE.ConeGeometry(1, 6, 3);
        geometryHelper.translate(0, 3, 0);
        geometryHelper.rotateX(Math.PI / 2);
        helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
        scene.add(helper);

        cameraControls = new CameraControls(camera, renderer.domElement);


        // Objects
        obj = new THREE.Object3D();
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        origMesh = new THREE.Mesh(sphere, material);
        hitMesh = new THREE.Mesh(sphere, material);
        hitMesh.scale.multiplyScalar(0.5);

        cylinderMesh = new THREE.Mesh(cylinder, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }));

        // Init the rotation root
        obj.add(cylinderMesh);
        obj.add(origMesh);
        obj.add(hitMesh);
        // obj.position.copy(camera.position)
        scene.add(obj);

        // set transforms
        origMesh.position.set(pointDist, 0, 0);
        // obj.rotation.x = Math.random() * 10;
        // obj.rotation.y = Math.random() * 10;

        // reusable vectors
        // const origVec = new THREE.Vector3();
        // const dirVec = new THREE.Vector3();
        // const xDir = (Math.random() - 0.5);
        // const yDir = (Math.random() - 0.5);
    }

    function Animate() {
        requestAnimationFrame(Animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        // cube.updateMatrixWorld();

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);

        obj.rotation.x += 0.5  * 1 * delta;
        obj.rotation.z += 0.5  * 1 * delta;
        // obj.rotation.z += 0.01;
        // obj.rotation.y += 0.01;
        // origMesh.rotation.z += 0.5 * 0.0001 * 1 * delta;

        cameraControls.update(delta);

        // origMesh.position.copy(camera)
        // origMesh.position.z += 50
        // obj.position.copy(camera.position)
        origMesh.updateMatrixWorld();
        origVec.setFromMatrixPosition(origMesh.matrixWorld);
        dirVec.copy(origVec).multiplyScalar(- 1).normalize();
        // console.log(dirVec)
        // dirVec.x = mouse.x
        // dirVec.y = mouse.y

        // raycaster.set(origVec, dirVec);
        raycaster.set(origVec, dirVec);
        // raycaster.setFromCamera(mouse, camera);
        raycaster.firstHitOnly = true;
        const res = raycaster.intersectObject(cube);
        const length = res.length ? res[0].distance : pointDist;

        hitMesh.position.set(pointDist - length, 0, 0);

        cylinderMesh.position.set(pointDist - (length / 2), 0, 0);
        cylinderMesh.scale.set(1, length, 1);

        cylinderMesh.rotation.z = Math.PI / 2;



        UpdateRaycast();

        renderer.render(scene, camera);
    }

    function onMouseMove(event) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        // dirVec.copy(new THREE.Vector3(mouse.x, mouse.y, 0))
        // origVec.x = (event.clientX / window.innerWidth) * 2 - 1;
        // origVec.y = - (event.clientY / window.innerHeight) * 2 + 1;
        // console.log(origVec)
        // UpdateRaycast();
    }

    function UpdateRaycast() {
        raycaster.setFromCamera(mouse, camera);

        // See if the ray from the camera into the world hits one of our meshes
        const intersects = raycaster.intersectObject(cube);

        // Toggle rotation bool for meshes that we clicked
        if (intersects.length > 0) {

            helper.position.set(0, 0, 0);
            helper.lookAt(intersects[0].face.normal);

            helper.position.copy(intersects[0].point);

        }
    }

    return <div ref={containerRef}></div>;
}
