import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls, helper, box;
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


    let group = new THREE.Group();
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    camera.position.z = 5;

    cameraControls = new CameraControls(camera, renderer.domElement);

    renderer.domElement.addEventListener('mousedown', onMouseDown, false);


    const geometryHelper = new THREE.ConeGeometry(1, 4, 3);
    geometryHelper.translate(0, 2, 0);
    geometryHelper.rotateX(Math.PI / 2);
    helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
    scene.add(helper);


    const sphere = new THREE.SphereGeometry();
    const object = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial(0xff0000));
    object.translateX(15)
    group.add(object)
    group.add(cube)

    scene.add(group)
    // scene.add(object)

    console.log(scene)
    // console.log(object)





    const geometry2 = new THREE.TorusBufferGeometry(10, 3, 16, 100);
    const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.1 });
    const torus2 = new THREE.Mesh(geometry2, material2);
    torus2.translateX(-20)
    scene.add(torus2);

    // box = new THREE.BoxHelper(torus2, 0xffff00);
    // box.update();
    // box.geometry.computeBoundingBox();

    // scene.add(box);

    box = new THREE.Box3().setFromObject(group);
    boxes.push(box)
    // scene.add(new THREE.BoxHelper(group, 0xffff00))


    let box2 = new THREE.Box3().setFromObject(torus2);
    boxes.push(box2)
    // scene.add(new THREE.BoxHelper(torus2, 0xffff00))
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


function ascSort( a, b ) {

	return a.distance - b.distance;

}



function getIntersectBox() {
  let intersects = [];

  boxes.map((box,i) => {

    let intersectedPoint = raycaster.ray.intersectBox(box, target);
  
    if (intersectedPoint) {
  
      // console.log(raycaster.ray.origin.distanceTo(intersectedPoint));
      let distance = raycaster.ray.origin.distanceTo(intersectedPoint);
      intersects.push({distance:distance, box:box })
    }
  })

  intersects.sort(ascSort);

  // return intersects[0];
  return intersects;
  
}


function handleClick() {
  console.log(onDownPosition.distanceTo(onUpPosition))
  if (onDownPosition.distanceTo(onUpPosition) === 0) {


    // getIntersects(onUpPosition, scene.children);

    // 걍 mesh store 에 box 만 추가할까 ? 레이어 처럼 ???
    // { splice: {mesh:"", layer:0, aabb:box3} }

    // {"splice":box3}
    //object entries 를 사용한 ... 
    // 이안에서 asc sort 적용 ... .

    // if ( raycaster.ray.intersectsBox( box ) === true ) {


    mouse.set((onUpPosition.x * 2) - 1, - (onUpPosition.y * 2) + 1);

    raycaster.setFromCamera(mouse, camera);

 

    let result = getIntersectBox();

    console.log(result);

    //box 에서 정보를 추출할수 있을까 ????
    // parent ?? 
    // distance 가 가까운 순서로 해야할것 ... 

    //  } 

    // asc 할 distance 를 구하는 three.js 내부로직 .... 
    //  const distance = raycaster.ray.origin.distanceTo( _intersectionPointWorld );

    //  if ( distance < raycaster.near || distance > raycaster.far ) return null;

    //  return {
    //    distance: distance,
    //    point: _intersectionPointWorld.clone(),
    //    object: object
    //  };


    // var intersects = getIntersects( onUpPosition, objects );
    // console.log(intersects)
    // if (intersects.length > 0) {

    //   var object = intersects[0].object;

    //   if (object.userData.object !== undefined) {

    //     // helper

    //     // editor.select( object.userData.object );

    //   } else {

    //     // editor.select( object );
    //     console.log("worked")

    //     // helper.position.set(0, 0, 0);
    //     // console.log(intersects[0])
    //     // helper.lookAt(intersects[0].face.normal);

    //     // helper.position.copy(intersects[0].point);

    //   }

    // } else {

    //   // editor.select( null );

    // }

    // render();

  }

}


// function movePin() {
//     helper.position.set(0, 0, 0);
//     helper.lookAt(intersects[0].face.normal);

//     helper.position.copy(intersects[0].point);
// }


// object picking




function getIntersects(point) {

  mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);

  raycaster.setFromCamera(mouse, camera);

  // return raycaster.intersectObjects(objects);

}