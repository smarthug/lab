import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { resizer, SceneSetUp } from '../Utils/utils'

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

let uniforms

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    useEffect(() => {
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
            1000
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
        
        camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);


        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

        renderer.setAnimationLoop(Animate);

        window.addEventListener("resize", () => resizer(camera, renderer));

        SceneSetUp(scene)



        const plane = new THREE.PlaneGeometry(2, 2);

        // const fragmentShader = `
        // #include <common>
      
        // uniform vec3 iResolution;
        // uniform float iTime;
      
        // // By iq: https://www.shadertoy.com/user/iq  
        // // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
        // void mainImage( out vec4 fragColor, in vec2 fragCoord )
        // {
        //     // Normalized pixel coordinates (from 0 to 1)
        //     vec2 uv = fragCoord/iResolution.xy;
      
        //     // Time varying pixel color
        //     vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
      
        //     // Output to screen
        //     fragColor = vec4(col,1.0);
        // }
      
        // void main() {
        //   mainImage(gl_FragColor, gl_FragCoord.xy);
        // }
        // `;

        const fragmentShader = `
        #include <common>
      
        uniform vec3 iResolution;
        uniform float iTime;
      
        // By iq: https://www.shadertoy.com/user/iq  
        // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    float dist = 5.0;
    
    float timeSpeed = 500.0;
    float posX = iTime * timeSpeed; 
    // posX += sin( iTime * 3. ) * 300.;
    posX +=  iTime * 3.  * 300.;
    posX = mod( posX, iResolution.x );
    
    
    bool isLit = abs( posX - fragCoord.x ) < dist;
    // bool isLit = false;

    // Time varying pixel color
    vec3 col = vec3( isLit ? 1. : 0. );
    col.g = col.b = 1.0 - (abs( posX - fragCoord.x ) * .02);

    // Output to screen
    fragColor = vec4(col,1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
        `;


        uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector3() },
        };
        let material2 = new THREE.ShaderMaterial({
            fragmentShader,
            uniforms,
            side:2
        });
        let pMesh = new THREE.Mesh(plane, material2)
        pMesh.position.set(0,3,0)
        scene.add(pMesh);


        cube = new THREE.Mesh(geometry, material2);
        cube.position.set(0,5,0);
        scene.add(cube);





        function TranslateHelperGeometry() {

            const geometry = new THREE.BufferGeometry();
        
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));
        
            return geometry;
        
        }
        
        const matHelper = new THREE.MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            side: THREE.DoubleSide,
            fog: false,
            toneMapped: false
        });
        
        
        // let deltaLine = new THREE.Line(TranslateHelperGeometry(), matHelper);
        let deltaLine = new THREE.Line(TranslateHelperGeometry(), material2);

        scene.add(deltaLine);
    }

    function Animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);


        uniforms.iResolution.value.set(canvasRef.current.width, canvasRef.current.height, 1);
        uniforms.iTime.value = performance.now()*0.001;

        renderer.render(scene, camera);
    }

    return (
        <div style={{
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
