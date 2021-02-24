import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

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

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;

    cameraControls = new CameraControls(camera, renderer.domElement);

    renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
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



function getMousePosition( dom, x, y ) {

    var rect = dom.getBoundingClientRect();
    return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

}



function onMouseDown( event ) {

    // event.preventDefault();

    var array = getMousePosition( renderer.domElement, event.clientX, event.clientY );
    onDownPosition.fromArray( array );

    document.addEventListener( 'mouseup', onMouseUp, false );

}

function onMouseUp( event ) {

    var array = getMousePosition( renderer.domElement, event.clientX, event.clientY );
    onUpPosition.fromArray( array );

    handleClick();

    document.removeEventListener( 'mouseup', onMouseUp, false );

}



function handleClick() {
    console.log(onDownPosition.distanceTo( onUpPosition ))
    if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

        // var intersects = getIntersects( onUpPosition, objects );

        // if ( intersects.length > 0 ) {

        //     var object = intersects[ 0 ].object;

        //     if ( object.userData.object !== undefined ) {

        //         // helper

        //         editor.select( object.userData.object );

        //     } else {

        //         editor.select( object );

        //     }

        // } else {

        //     editor.select( null );

        // }

        // render();

    }

}