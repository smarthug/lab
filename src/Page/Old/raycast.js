import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls, helper;
const clock = new THREE.Clock();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();





export default function Main() {
    const containerRef = useRef();
    useEffect(() => {
        Init();
        Animate();
        window.addEventListener('mouseup', onMouseMove, false);
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

        var geometry = new THREE.BoxGeometry(100, 100, 100);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        console.log(cube);
        // cube.raycast = () => {
        //     console.log("I am honored")
        // }
        // cube.raycast 
        camera.position.z = 200;

        const geometryHelper = new THREE.ConeGeometry(0.1, 0.6, 3);
        geometryHelper.translate(0, 0.3, 0);
        geometryHelper.rotateX(Math.PI / 2);
        helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
        scene.add(helper);

        cameraControls = new CameraControls(camera, renderer.domElement);
    }

    function Animate() {
        requestAnimationFrame(Animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        cube.updateMatrixWorld();

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        

        UpdateRaycast();

        renderer.render(scene, camera);
    }

    function onMouseMove(event) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
    
        mouse.x = (event.clientX / window.innerWidth) *2 -1 ;
        mouse.y = -(event.clientY / window.innerHeight) *2 +1 ;

        // console.log(mouse.x , mouse.y)
    
    
        // UpdateRaycast();
    }

    function UpdateRaycast(){
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
