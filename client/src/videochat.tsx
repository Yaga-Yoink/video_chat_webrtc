import { FC } from "react";

interface VideoChatProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  updateTrigger: boolean;
}

const VideoChat: FC<VideoChatProps> = ({ videoRef, updateTrigger }) => {
  updateTrigger;
  console.log("rerendered video");
  return (
    <div>
      <p>hello im here</p>
      <video width="250" ref={videoRef} autoPlay controls={false}></video>
    </div>
  );
};

export default VideoChat;
