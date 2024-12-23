import { useState, useEffect, useRef } from "react";
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
async function makeOffer(peerConnection: RTCPeerConnection | null) {
  console.log("making a peerconnection");
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection(configuration);
  }
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("sdp_offer_server", offer);
  console.log("socket send sdp offer to server");
}

/**
 * Receives an sdp offer from the signalling server and sends an sdp answer back.
 * @param peerConnection : the peer connection object
 * @param offer : an sdp offer from the signalling server
 * @modifies sends a session description protocol answer to the signaling server
 */
async function receiveOffer(
  peerConnection: RTCPeerConnection | null,
  offer: RTCSessionDescriptionInit
) {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection(configuration);
  }
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  console.log(peerConnection.connectionState);
  socket.emit("sdp_answer_server", answer);
}

/**
 * Receives an sdp answer from the signalling server and sets the local description without emitting a new event.
 * @param peerConnection : the peer connection object
 * @param offer : an sdp offer from the signalling server
 * @modifies sends a session description protocol answer to the signaling server
 */
async function finishSDP(
  peerConnection: RTCPeerConnection | null,
  answer: RTCSessionDescriptionInit
) {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection(configuration);
  }
  const remoteDesc = new RTCSessionDescription(answer);
  await peerConnection.setRemoteDescription(remoteDesc);
}

//
async function receiveAnswer(answer: RTCSessionDescriptionInit) {}

function App() {
  const peerConnection = useRef<RTCPeerConnection>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  function handleClick() {}
  useEffect(() => {
    socket.on("connect", () => {
      console.log("user connected to server with socketio");
      // server is asking for an sdp offer
      socket.on("sdp_offer_client", () => {
        console.log("sdp offer was requested (client)");
        makeOffer(peerConnection.current);
      });
      // server is sending an sdp answer from the other client
      socket.on("sdp_answer_client", (offer: RTCSessionDescriptionInit) => {
        console.log("sdp answer was requested (client)");
        receiveOffer(peerConnection.current, offer);
      });
      // server is sending an sdp answer from the other client
      socket.on("sdp_finish_client", (offer: RTCSessionDescriptionInit) => {
        console.log("sdp finish was requested (client)");
        finishSDP(peerConnection.current, offer);
      });
    });
    socket.listeners("");
    return () => {
      socket.off("connect");
      socket.off("sdp_offer_client");
      socket.off("sdp_answer_client");
      socket.off("sdp_finish_client");
    };
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
