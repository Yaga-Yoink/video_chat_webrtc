import { useState, useEffect, useRef } from "react";
import "./App.css";
import VideoChat from "./videochat.tsx";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function App() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream>(new MediaStream());
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  useEffect(() => {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection(configuration);
    }

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

    peerConnectionRef.current.addEventListener("connectionstatechange", () => {
      switch (peerConnectionRef.current?.connectionState) {
        case "connected":
          if (!localStreamRef.current) {
            start();
          }
          const videoTrack = localStreamRef.current?.getVideoTracks()[0];
          const audioTrack = localStreamRef.current?.getAudioTracks()[0];
          if (videoTrack && audioTrack) {
            peerConnectionRef.current.addTrack(videoTrack);
            peerConnectionRef.current.addTrack(audioTrack);
          }
      }
    });

    peerConnectionRef.current.addEventListener("track", (event) => {
      if (remoteStreamRef.current) {
        remoteStreamRef.current.addTrack(event.track);
      }
      if (
        remoteStreamRef.current?.getAudioTracks().length === 1 &&
        remoteStreamRef.current?.getVideoTracks().length === 1
      ) {
        console.log("inside remotestreamref");
        remoteVideoRef.current!.srcObject = remoteStreamRef.current;
        console.log("remote video", remoteVideoRef.current);
        setUpdateTrigger(!updateTrigger);
      }
    });

    return () => {
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
    peerConnectionRef.current.addTransceiver("video");
    peerConnectionRef.current.addTransceiver("audio");
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

  //TODO: add the functioanlity to switch to next person
  async function start() {
    const constraints = { audio: true, video: true };
    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = localStream;

    //TEMP:: USED FOR TESTING WHILE IMPROVING UI
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = localStream;
    }
    //

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    // localStream.getTracks().forEach((track) => {
    //   peerConnectionRef.current?.addTrack(track, localStream);
    // });
  }

  return (
    <>
      <div className="left">
        <div className="top">
          <div className="video_box">
            <VideoChat
              videoRef={remoteVideoRef}
              updateTrigger={updateTrigger}
            />
          </div>
        </div>
        <div className="bottom">
          <div className="video_box">
            <VideoChat videoRef={localVideoRef} updateTrigger={updateTrigger} />
          </div>
        </div>
      </div>
      <div className="right">
        <button onClick={start}>Start</button>
      </div>
    </>
  );
}

export default App;
