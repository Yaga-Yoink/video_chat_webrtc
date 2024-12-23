import { useRef, FC, useEffect } from "react";
import VideoChat from "./videochat";

interface VideoChatProps {
  updateTrigger: number;
}

const RemoteVideoChat: FC<VideoChatProps> = ({ updateTrigger }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return <VideoChat videoRef={videoRef} />;
};

export default RemoteVideoChat;
