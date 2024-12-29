import { FC } from "react";
import "./videochat.css";

interface VideoChatProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  updateTrigger: boolean;
}

const VideoChat: FC<VideoChatProps> = ({ videoRef, updateTrigger }) => {
  updateTrigger;
  console.log("rerendered video", videoRef);
  return (
    <video className="video" ref={videoRef} autoPlay controls={false}></video>
  );
};

export default VideoChat;
