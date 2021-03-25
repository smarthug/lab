import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

import { Text } from "troika-three-text";
// import TestKorean from './BMDOHYEON_ttf.ttf'
import TestKorean from './NotoSansKR-Regular.otf'

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

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

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        // scene.add(cube);
        camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);
            let text 
        for(let i = 0 ; i <1000;i++) {

            // text =
            //  i + "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
            
             text =
             i + "처음이라 그래 며칠뒤엔 괜찮아져그 생각만으로 벌써 일년이너와 만든 기념일마다 슬픔은 나를 찾아와...처음 사랑고백하며 설렌 수줍음과우리 처음 만난 날 지나가고너의 생일에 눈물의 케익 촛불켜고서 축하해I believe in you. I believe in your mind.벌써 일년이 지났지만일년뒤에도 그 일년 뒤에도 널 기다려너무 보고싶어 돌아와줘 말못했어널 보는 따뜻한 그의 눈빛과니 왼손에 껴진 반지보다 빛난 니 얼굴 때문에.I believe in you. I believe in your mind.다시 시작한 널 알면서이젠 나 없이 추억을 만드는 너라는걸내가 기억하는 추억은 언제나지난 웃음과 얘기와 바램들또 새로 만들 추억은 하나뿐내 기다림과 눈물속... 너일뿐...I believe in you. I believe in your mind.다시 시작한 널 알면서이젠 나없이 추억을 만드는 너라는걸...I believe in you. I believe in your mind.벌써 일년이 지났지만";
            
             // Create:
            const myText = new Text()
            scene.add(myText)

            
    
            // Set properties to configure:
            myText.text = text
              
            myText.font = TestKorean
            myText.fontSize = 0.2
            myText.maxWidth = 300;
            myText.position.z = -i/10
            myText.color = 0x9966FF
    
            // Update the rendering:
            myText.sync()
        }

    }

    function Animate() {
        requestAnimationFrame(Animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        renderer.render(scene, camera);
    }

    return <div ref={containerRef}></div>;
}
