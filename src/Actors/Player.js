import Actor from './Actor'
import * as THREE from 'three'

export default class Enemy extends Actor {
    constructor() {
        super();
        this.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial()));
    }


    beginPlay() {
        console.log("Enemy shown");
    }

    tick() {
        // rotate after ...
        this.rotation.x += 0.01;
        this.rotation.y += 0.01;

        // if(){
        //     // animation blending 의 영역이군 ... 
        // }
    }

}


// 0, 0 일때만 