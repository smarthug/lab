import Actor from './Actor'
import * as THREE from 'three'

let mixer;

export let idleAction = { play: () => { }, stop: () => { } };
export let walkAction = { play: () => { }, stop: () => { } };
export let runAction = { play: () => { }, stop: () => { } };

export default class Player extends Actor {
    constructor() {
        super();
        this.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial()));




        function Loader() {
            const loader = new GLTFLoader()
                // .setCrossOrigin('anonymous')
                .setDRACOLoader(new DRACOLoader().setDecoderPath("assets/wasm/"))
                .setKTX2Loader(
                    new KTX2Loader().setTranscoderPath("assets/wasm/").detectSupport(renderer)
                )
                .setMeshoptDecoder(MeshoptDecoder);
        
            const blobURLs = [];
        
            loader.load("model/Soldier.glb", (gltf) => {
                const scene2 = gltf.scene || gltf.scenes[0];
                const clips = gltf.animations || [];
                if (!scene2) {
                    // Valid, but not supported by this viewer.
                    throw new Error(
                        "This model contains no scene, and cannot be viewed here. However," +
                        " it may contain individual 3D resources."
                    );
                }
                player = scene2;
                // scene.add(player);
                const animations = gltf.animations;
                mixer = new THREE.AnimationMixer(player);
                idleAction = mixer.clipAction(animations[0]);
                walkAction = mixer.clipAction(animations[3]);
                runAction = mixer.clipAction(animations[1]);
                idleAction.play();
            });
        }
        
    }


    beginPlay() {
        console.log("player shown");
    }

    tick() {
       // movement 로직 여기로 ...

        // if(){
        //     // animation blending 의 영역이군 ... 
        // }
    }

}


// 0, 0 일때만 