import { useState, useEffect } from "react";
import "./App.css";
import "./localvideochat.tsx";
import LocalVideoChat from "./localvideochat.tsx";
import RemoteVideoChat from "./remotevideochat.tsx";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/**
 * Makes an offer to the other peer.
 * @modifies sends a sesssion description protocol to the signalling server
 */
async function makeOffer() {
  const peerConnection = new RTCPeerConnection(configuration);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("sdp_offer", offer);
}

/**
 * Receives an sdp offer from the signalling server and sends an sdp answer back.
 * @param offer : an sdp offer from the signalling server
 * @modifies sends a session description protocol answer to the signaling server
 */
async function receiveOffer(offer: RTCSessionDescriptionInit) {
  const peerConnection = new RTCPeerConnection(configuration);
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("sdp_answer", answer);
}

function App() {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  function handleClick() {
    makeOffer();
  }
  useEffect(() => {
    socket.on("connect", () => {
      console.log("user connected to server with socketio");
      // server is asking for an sdp offer
      socket.on("sdp_offer", () => {
        makeOffer();
      });
      // server is sending an sdp answer from the other client
      socket.on("sdp_answer", (offer: RTCSessionDescriptionInit) => {
        receiveOffer(offer);
      });
      socket.on("disconnect", () => {
        console.log("user disconnected from server with socketio");
      });
    });
  }, []);

  return (
    <>
      <div className="card">{/* <p>{data.toString()}</p> */}</div>
      <button onClick={handleClick}>Next Person</button>
      <LocalVideoChat updateTrigger={updateTrigger} />
      <RemoteVideoChat updateTrigger={updateTrigger} />
    </>
  );
}

export default App;
