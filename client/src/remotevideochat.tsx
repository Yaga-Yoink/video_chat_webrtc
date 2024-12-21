import { useRef, FC } from "react";
import VideoChat from "./videochat";
import { io } from "socket.io-client";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const peerConnection = new RTCPeerConnection(configuration);
const socket = io("http://localhost:8080");

interface VideoChatProps {
  updateTrigger: number;
}

const RemoteVideoChat: FC<VideoChatProps> = ({ updateTrigger }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  return <VideoChat videoRef={videoRef} />;
};

export default RemoteVideoChat;
