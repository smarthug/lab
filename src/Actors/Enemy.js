import Actor from './Actor'

export default class Enemy extends Actor {
    constructor(){
        super();
        this.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshNormalMaterial()));
    }


    beginPlay(){
        console.log("Enemy shown");
    }

    tick(){
        // rotate after ...
    }

}