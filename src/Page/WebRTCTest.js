import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

import { resizer, SceneSetUp } from "../Utils/utils";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

// Define "global" variables

var connectButton = null;
var disconnectButton = null;
var sendButton = null;
var messageInputBox = null;
var receiveBox = null;

var localConnection = null; // RTCPeerConnection for our "local" connection
var remoteConnection = null; // RTCPeerConnection for the "remote"

var sendChannel = null; // RTCDataChannel for the local (sender)
var receiveChannel = null; // RTCDataChannel for the remote (receiver)

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
      10000
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
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;

    cameraControls = new CameraControls(camera, renderer.domElement);

    vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

    renderer.setAnimationLoop(Animate);

    window.addEventListener("resize", () => resizer(camera, renderer));

    SceneSetUp(scene);
  }

  function Animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    renderer.render(scene, camera);
  }

  function setUpWebRTC() {}

  function handleCreate() {
    console.log("create");
  }

  function handleConnect() {
    console.log("connect");
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowX: "hidden",
        overflowY: "hidden",
      }}
      ref={containerRef}
    >
      <div
        style={{
          position: "absolute",
        }}
      >
        {/* <button onClick={handleCreate}>Create</button> */}
        <button onClick={connectPeers}>Connect</button>
        <button onClick={disconnectPeers}>Disconnect</button>
        <button onClick={sendMessage}>Send</button>
      </div>
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}

// Set things up, connect event listeners, etc.

function startup() {
  // connectButton = document.getElementById('connectButton');
  // disconnectButton = document.getElementById('disconnectButton');
  // sendButton = document.getElementById('sendButton');
  // messageInputBox = document.getElementById('message');
  // receiveBox = document.getElementById('receivebox');
  // Set event listeners for user interface widgets
  // connectButton.addEventListener('click', connectPeers, false);
  // disconnectButton.addEventListener('click', disconnectPeers, false);
  // sendButton.addEventListener('click', sendMessage, false);
}

// Connect the two peers. Normally you look for and connect to a remote
// machine here, but we're just connecting two local objects, so we can
// bypass that step.

function connectPeers() {
  // Create the local connection and its event listeners

  localConnection = new RTCPeerConnection();

  // Create the data channel and establish its event listeners
  sendChannel = localConnection.createDataChannel("sendChannel");
  sendChannel.onopen = handleSendChannelStatusChange;
  sendChannel.onclose = handleSendChannelStatusChange;

  // Create the remote connection and its event listeners

  remoteConnection = new RTCPeerConnection();
  remoteConnection.ondatachannel = receiveChannelCallback;

  // Set up the ICE candidates for the two peers

  localConnection.onicecandidate = (e) =>
    !e.candidate ||
    remoteConnection
      .addIceCandidate(e.candidate)
      .catch(handleAddCandidateError);

  remoteConnection.onicecandidate = (e) =>
    !e.candidate ||
    localConnection.addIceCandidate(e.candidate).catch(handleAddCandidateError);

  // Now create an offer to connect; this starts the process

  // localConnection.createOffer()
  // .then(offer => localConnection.setLocalDescription(offer))
  // .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
  // .then(() => remoteConnection.createAnswer())
  // .then(answer => remoteConnection.setLocalDescription(answer))
  // .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
  // .catch(handleCreateDescriptionError);

  localConnection
    .createOffer()
    .then((offer) => {
      console.log("offer", offer);
      return localConnection.setLocalDescription(offer);
    })
    .then(() => {
      console.log("local localDescription", localConnection.localDescription);
      return remoteConnection.setRemoteDescription(
        localConnection.localDescription
      );
    })
    .then(() => {
      return remoteConnection.createAnswer();
    })
    .then((answer) => {
      console.log("answer", answer);
      return remoteConnection.setLocalDescription(answer);
    })
    .then(() => {
      console.log("remote localdescription", remoteConnection.localDescription);
      return localConnection.setRemoteDescription(
        remoteConnection.localDescription
      );
    })
    .catch(handleCreateDescriptionError);
}

// Handle errors attempting to create a description;
// this can happen both when creating an offer and when
// creating an answer. In this simple example, we handle
// both the same way.

function handleCreateDescriptionError(error) {
  console.log("Unable to create an offer: " + error.toString());
}

// Handle successful addition of the ICE candidate
// on the "local" end of the connection.

function handleLocalAddCandidateSuccess() {
  connectButton.disabled = true;
}

// Handle successful addition of the ICE candidate
// on the "remote" end of the connection.

function handleRemoteAddCandidateSuccess() {
  disconnectButton.disabled = false;
}

// Handle an error that occurs during addition of ICE candidate.

function handleAddCandidateError() {
  console.log("Oh noes! addICECandidate failed!");
}

// Handles clicks on the "Send" button by transmitting
// a message to the remote peer.

function sendMessage() {
  // var message = messageInputBox.value;
  var message = "test";
  sendChannel.send(message);
  // console.log(message)

  // Clear the input box and re-focus it, so that we're
  // ready for the next message.

  // messageInputBox.value = "";
  // messageInputBox.focus();
}

// Handle status changes on the local end of the data
// channel; this is the end doing the sending of data
// in this example.

function handleSendChannelStatusChange(event) {
  if (sendChannel) {
    var state = sendChannel.readyState;

    if (state === "open") {
      // messageInputBox.disabled = false;
      // messageInputBox.focus();
      // sendButton.disabled = false;
      // disconnectButton.disabled = false;
      // connectButton.disabled = true;
    } else {
      // messageInputBox.disabled = true;
      // sendButton.disabled = true;
      // connectButton.disabled = false;
      // disconnectButton.disabled = true;
    }
  }
}

// Called when the connection opens and the data
// channel is ready to be connected to the remote.

function receiveChannelCallback(event) {
  receiveChannel = event.channel;
  receiveChannel.onmessage = handleReceiveMessage;
  receiveChannel.onopen = handleReceiveChannelStatusChange;
  receiveChannel.onclose = handleReceiveChannelStatusChange;
}

// Handle onmessage events for the receiving channel.
// These are the data messages sent by the sending channel.

function handleReceiveMessage(event) {
  // var el = document.createElement("p");
  // var txtNode = document.createTextNode(event.data);

  // el.appendChild(txtNode);
  // receiveBox.appendChild(el);

  console.log(event);
}

// Handle status changes on the receiver's channel.

function handleReceiveChannelStatusChange(event) {
  if (receiveChannel) {
    console.log(
      "Receive channel's status has changed to " + receiveChannel.readyState
    );
  }

  // Here you would do stuff that needs to be done
  // when the channel's status changes.
}

// Close the connection, including data channels if they're open.
// Also update the UI to reflect the disconnected status.

function disconnectPeers() {
  // Close the RTCDataChannels if they're open.

  sendChannel.close();
  receiveChannel.close();

  // Close the RTCPeerConnections

  localConnection.close();
  remoteConnection.close();

  sendChannel = null;
  receiveChannel = null;
  localConnection = null;
  remoteConnection = null;

  // Update user interface elements

  connectButton.disabled = false;
  disconnectButton.disabled = true;
  sendButton.disabled = true;

  messageInputBox.value = "";
  messageInputBox.disabled = true;
}
