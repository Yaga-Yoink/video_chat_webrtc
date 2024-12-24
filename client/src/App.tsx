import { useState, useEffect, useRef } from "react";
import "./App.css";
import LocalVideoChat from "./localvideochat.tsx";
import RemoteVideoChat from "./remotevideochat.tsx";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function App() {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection(configuration);
    }

    const handleConnect = () => {
      console.log("user connected to server with socketio");
    };

    const handleSDPOfferClient = () => {
      console.log("sdp offer was requested (client)");
      makeOffer();
    };

    const handleSDPAnswerClient = (offer: RTCSessionDescriptionInit) => {
      console.log("sdp answer was requested (client)");
      receiveOffer(offer);
      console.log("can accept trick candidates", peerConnectionRef.current);
    };

    const handleSDPFinishClient = (offer: RTCSessionDescriptionInit) => {
      console.log("sdp finish was requested (client)");
      finishSDP(offer);
      console.log("can accept trick candidates", peerConnectionRef.current);
    };

    const handleReceiveIceCandidate = (candidate: RTCIceCandidate) => {
      console.log("ice candidate received");
      receiveIceCandidate(candidate);
    };

    socket.on("connect", handleConnect);
    socket.on("sdp_offer_client", handleSDPOfferClient);
    socket.on("sdp_answer_client", handleSDPAnswerClient);
    socket.on("sdp_finish_client", handleSDPFinishClient);
    socket.on("ice_candidate_client", handleReceiveIceCandidate);

    peerConnectionRef.current.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log("new ice candidate (client)");
        socket.emit("new_ice_candidate", event.candidate);
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("sdp_offer_client", handleSDPOfferClient);
      socket.off("sdp_answer_client", handleSDPAnswerClient);
      socket.off("sdp_finish_client", handleSDPFinishClient);
      socket.off("ice_candidate_client", handleReceiveIceCandidate);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, []);

  async function makeOffer() {
    if (!peerConnectionRef.current) return;
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("sdp_offer_server", offer);
  }

  async function receiveOffer(offer: RTCSessionDescriptionInit) {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit("sdp_answer_server", answer);
  }

  async function finishSDP(answer: RTCSessionDescriptionInit) {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection(configuration);
    }
    await peerConnectionRef.current.setRemoteDescription(answer);
  }

  async function receiveIceCandidate(candidate: RTCIceCandidate) {
    try {
      await peerConnectionRef.current?.addIceCandidate(candidate);
    } catch (e) {
      console.log("Error adding received ice candidate", e);
    }
  }

  function handleClick() {
    socket.emit("message", "next person");
    setUpdateTrigger(updateTrigger + 1);
  }

  return (
    <>
      <div className="card"></div>
      <button onClick={handleClick}>Next Person</button>
      <LocalVideoChat updateTrigger={updateTrigger} />
      <RemoteVideoChat updateTrigger={updateTrigger} />
    </>
  );
}

export default App;
