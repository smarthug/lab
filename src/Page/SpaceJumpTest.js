import React, { useEffect, useLayoutEffect, useRef } from "react";

import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";


import SpatialControls from "../Utils/SpaceJump";

import { InteractiveGroup } from "./testGroup";
import { HTMLMesh } from "./testHTML";


import { SceneSetUp } from "../Utils/utils";


import * as Dat from "dat.gui";

import './dat.css'


let scene, renderer;
let spatialControls = { update: () => { } };
let interactiveGroup;

let cameraRig;



let controller0;
let controller1;

let CreateSpatialControlsOut;
let material = new THREE.MeshNormalMaterial();

// const SeqComponent = loadable(() => import("../../newInspector/component"));

let parameters;

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const xrcamera = useRef();
    // const seqUI = useRef();

    useLayoutEffect(() => {
        Init();


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function Init() {
        scene = new THREE.Scene();

        const color = 0x000000;
        const near = 10;
        const far = 100;
        scene.fog = new THREE.Fog(color, near, far);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        renderer.xr.setFramebufferScaleFactor(2.0);

        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));
        document.getElementById("VRButton").style.visibility = "hidden";

        cameraRig = new THREE.Group();
        controller0 = renderer.xr.getController(0);
        controller1 = renderer.xr.getController(1);
        xrcamera.current = renderer.xr.getCamera();

        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -5),
        ]);

        controller0.add(new THREE.Line(geometry));
        controller1.add(new THREE.Line(geometry));

        scene.add(cameraRig);
        cameraRig.add(xrcamera.current);
        cameraRig.add(controller0);
        cameraRig.add(controller1);

        // cameraRig.position.set(0, 0, 5);
        // SceneSetUp(scene);
        // updateEnvironment(scene,renderer)
        // window.addEventListener("resize", () => resizer(camera, renderer));

        const controllerModelFactory = new XRControllerModelFactory();

        let controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(
            controllerModelFactory.createControllerModel(controllerGrip1)
        );

        let controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(
            controllerModelFactory.createControllerModel(controllerGrip2)
        );

        cameraRig.add(controllerGrip1);
        cameraRig.add(controllerGrip2);

        // let destMarker = new THREE.Group();
        // scene.add(destMarker);

        // Loader(`${front_url_prefix}/model/SmilingFaceWithSunglassesEmoji.glb`, destMarker, (obj) => {
        //     obj.scale.setScalar(0.1)
        //     // console.log(obj.material)
        //     // console.log(obj)
        //     obj.children[0].material.transparent = true
        //     obj.children[0].material.opacity = 0.5
        // })
        // Loader(`${front_url_prefix}/model/SmilingFace.glb`, destMarker)

        const loader = new THREE.FontLoader();

        let playerHandHelper = new THREE.Group();
        let destHandHelper = new THREE.Group();


        //`${front_url_prefix}/fonts/helvetiker_regular.typeface.json`,
        //`${front_url_prefix}/model/${models[tmp]}.gltf`
        //`${front_url_prefix}/fonts/helvetiker_regular.typeface.json`
        loader.load(
            `fonts/helvetiker_regular.typeface.json`,
            font => {
                const geometry = new THREE.TextGeometry("From", {
                    font: font,
                    size: 0.05,
                    height: 0.05,
                });

                playerHandHelper.add(
                    new THREE.Mesh(geometry, new THREE.MeshNormalMaterial())
                );

                const geometry2 = new THREE.TextGeometry("To", {
                    font: font,
                    size: 0.05,
                    height: 0.05,
                });

                destHandHelper.add(
                    new THREE.Mesh(geometry2, new THREE.MeshNormalMaterial())
                );
            }
        );

        parameters = {
            teleportDistance: 3,
            handsChange: () => { },
            run: () => {
                // RunSeq();
                // exportedSend({ type: "runSeq" });
            },
            exit: () => {
                const session = renderer.xr.getSession();
                session.end().then(() => {
                    interactiveGroup.dispose();

                    spatialControls.dispose();

                    // scene.remove(interactiveGroup)
                    cameraRig.remove(interactiveGroup);
                    // interactiveGroup.removeFromParent();
                });
            },
        };

        // gui.domElement.style.opacity = '0.5';

        CreateSpatialControlsOut = function () {
            spatialControls = new SpatialControls(
                renderer,
                cameraRig,
                controller0,
                controller1,
                {
                    // destMarker: destMarker,
                    rightHanded: true,
                    playerHandHelper: playerHandHelper,
                    destHandHelper: destHandHelper,
                    multiplyScalar: 1,
                }
            );
        };

        var geometry2 = new THREE.BoxGeometry(1, 1, 1);

        let cube = new THREE.Mesh(geometry2, material);
        scene.add(cube);

        renderer.setAnimationLoop(Animate);

        ////
        // ExportedEnterPlayer = EnterPlayer;
        // ExportedRunSeq = RunSeq;
        // ExportedNodeValueChange = NodeValueChange;

        SceneSetUp(scene);
    }
    // const send = throttle(() => {
    //     exportedPosSend.head(xrcamera.current.matrixWorld.toArray().join(" "));
    //     exportedPosSend.controllers(
    //         cameraRig.children[2].matrixWorld.toArray().join(" "),
    //         cameraRig.children[3].matrixWorld.toArray().join(" ")
    //     );
    //     // exportedPosSend.controllers(controll)
    // }, 40);

    function Animate() {
        spatialControls.update();
        // send();
        if (!!xrcamera.current) renderer.render(scene, xrcamera.current);
    }

    function windowResizer({ height, width }) { }

    function handleXR() {
        CreateSpatialControlsOut();
        interactiveGroup = new InteractiveGroup(renderer, xrcamera.current);
        // scene.add(interactiveGroup);
        // cameraRig.children[3].add(interactiveGroup);

        // righthandHTMLMesh
        // cameraRig.children[5].add(interactiveGroup);

        // const mesh = new HTMLMesh(seqUI.current);
        // mesh.position.x = 0.3;
        // mesh.position.y = 0;
        // mesh.position.z = 0;
        // mesh.rotation.x = -Math.PI / 3;
        // mesh.rotation.y = Math.PI / 2;

        const gui = new Dat.GUI({ width: 300 });
        gui.add(parameters, "teleportDistance", 1, 100, 1).onChange(
            setTeleportDistance
        );
        gui.add(parameters, "handsChange").onChange(fireHandsChange);
        gui.add(parameters, "exit");

        const xrSettingsMesh = new HTMLMesh(gui.domElement);
        xrSettingsMesh.position.x = -0.15;
        xrSettingsMesh.position.y = 0;
        xrSettingsMesh.position.z = 0;
        // xrSettingsMesh.rotation.x = -Math.PI / 3;
        // xrSettingsMesh.rotation.y = (Math.PI) / 2;

        // xrSettingsMesh.scale.setScalar(1);

        interactiveGroup.position.x = 0.2;
        interactiveGroup.rotation.x = -Math.PI / 3;
        interactiveGroup.rotation.y = (2 * Math.PI) / 3;

        controller0.addEventListener(
            "connected",
            ({ data }) => {
                if (data.handedness === "right") {
                    controller1.add(interactiveGroup);
                    return;
                }

                controller0.add(interactiveGroup);
                return;
            },
            { once: true }
        );

        // interactiveGroup.add(mesh);
        interactiveGroup.add(xrSettingsMesh);

        document.getElementById("VRButton").click();
    }

    // function EnterPlayer(pos, color, num) {
    //     // const geometry = new THREE.BoxGeometry(1, 1, 1);
    //     // const material = new THREE.MeshBasicMaterial({ color: color });
    //     // const cube = new THREE.Mesh(geometry, material);
    //     // cube.position.set(0, pos, 0);

    //     let player = new THREE.Group();
    //     scene.add(player);

    //     let exporter = {
    //         head: new THREE.Mesh(
    //             new THREE.BoxGeometry(0.5, 0.5, 0.5),
    //             material
    //         ),
    //         left: new THREE.Mesh(
    //             new THREE.BoxGeometry(0.05, 0.05, 0.05),
    //             material
    //         ),
    //         right: new THREE.Mesh(
    //             new THREE.BoxGeometry(0.05, 0.05, 0.05),
    //             material
    //         ),
    //     };

    //     player.add(exporter.head);
    //     player.add(exporter.left);
    //     player.add(exporter.right);

    //     return exporter;
    // }

    // function RunSeq(id) {
    //     console.log(id);
    //     if (!!id && typeof id === "string") {
    //         startGraph(id);
    //     }
    // }

    // function NodeValueChange(value) {
    //     console.log(value);
    //     let list = window.xManager.Sequence.getList();
    //     console.log(list);
    //     // maybe filltering by "선형정보"
    //     let lineGraphInfo = list._tail.array[1];
    //     console.log(lineGraphInfo);

    //     window.xManager.Sequence.get(lineGraphInfo.id).then(graph => {
    //         // fillter by name 'basestation'
    //         // graph._nodes_executable[0].properties.value = 899452;
    //         graph._nodes_executable[0].properties.value = value;
    //     });
    // }

    function setTeleportDistance(value) {
        // console.log(value);
        spatialControls.setDistance(value);
    }

    function fireHandsChange() {
        // console.log("test")
        // spatialControls.handsInit(false);
        // rightHanded = !rightHanded
        // let tmp = true;
        // if (spatialControls._handsOrder) {
        //     tmp = spatialControls._hander === "right" ? true : false;
        // } else {
        //     tmp = spatialControls._hander === "right" ? false : true;
        // }

        let tmp = spatialControls._hander === "right" ? true : false;
        spatialControls.handsInit(!tmp);
    }

    return (
        <React.Fragment>
            <div
                style={
                    {
                        height: "100vh",
                        overflowX: "hidden",
                        overflowY: "hidden",
                    }
                }
                ref={containerRef}>
                <div
                    style={{
                        position: "absolute"
                    }}
                >
                    <button onClick={handleXR}>EnterXR</button>
                </div>
                <canvas ref={canvasRef} />
                <div ref={vrButtonConRef}></div>
            </div>
        </React.Fragment>
    );
}
