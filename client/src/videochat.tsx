import { FC } from "react";

interface VideoChatProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  updateTrigger: boolean;
}

const VideoChat: FC<VideoChatProps> = ({ videoRef, updateTrigger }) => {
  return (
    <div>
      <p>hello im here</p>
      <video width="250" ref={videoRef} autoPlay></video>
    </div>
  );
};

export default VideoChat;
