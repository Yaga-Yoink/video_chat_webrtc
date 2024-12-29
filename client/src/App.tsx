import { useState, useEffect, useRef } from "react";
import "./App.css";
import VideoChat from "./videochat.tsx";
import TextChat from "./textchat.tsx";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function App() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  // media streams for creating the video refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  // the refs which store the video for the html tag
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  // flag for making videochat re render
  const [updateTrigger, setUpdateTrigger] = useState(false);
  // flag for a resetting the peer connection (changed when the user wants to meet a new person)
  const [resetConnection, setResetConnection] = useState(false);

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
    // change the flag so that the useeffect runs the cleanup function
    socket.on("reset_connection", () => {
      console.log("reseting connection");
      setResetConnection(!resetConnection);
    });

    peerConnectionRef.current.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log("new ice candidate (client)");
        socket.emit("new_ice_candidate", event.candidate);
      }
    });

    peerConnectionRef.current.addEventListener("connectionstatechange", () => {
      switch (peerConnectionRef.current?.connectionState) {
        case "connected":
          let tracks = peerConnectionRef.current.getReceivers();
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
            remoteStreamRef.current.addTrack(tracks[0].track);
            remoteStreamRef.current.addTrack(tracks[1].track);
          } else {
            remoteStreamRef.current.addTrack(tracks[0].track);
            remoteStreamRef.current.addTrack(tracks[1].track);
          }
          if (remoteVideoRef.current) {
            remoteVideoRef.current!.srcObject = remoteStreamRef.current;
            console.log("remotevideoref", remoteVideoRef.current);
            console.log("remotestreamref", remoteStreamRef.current);
          }
          setUpdateTrigger(!updateTrigger);
        // console.log("connected", peerConnectionRef.current.getReceivers());
      }
    });

    // peerConnectionRef.current.addEventListener("track", (event) => {
    //   if (remoteStreamRef.current) {
    //     console.log("added track to remote stream ref");
    //     remoteStreamRef.current.addTrack(event.track);
    //   }
    //   if (
    //     remoteStreamRef.current?.getAudioTracks().length === 1 &&
    //     remoteStreamRef.current?.getVideoTracks().length === 1
    //   ) {
    //     console.log("inside remotestreamref", remoteStreamRef);
    //     remoteVideoRef.current!.srcObject = remoteStreamRef.current;
    //     console.log("remote video", remoteVideoRef.current);
    //     setUpdateTrigger(!updateTrigger);
    //   }
    // });

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
  }, [resetConnection]);

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

  //TODO: add the functioanlity to switch to next person
  async function start() {
    const constraints = { audio: true, video: true };
    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = localStream;

    // //TEMP:: USED FOR TESTING WHILE IMPROVING UI
    // if (remoteVideoRef.current) {
    //   remoteVideoRef.current.srcObject = localStream;
    // }
    // //

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    localStream.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, localStream);
    });
    socket.emit("sdp_start");
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
        <TextChat onButtonClick={() => start()} />
      </div>
    </>
  );
}

export default App;
