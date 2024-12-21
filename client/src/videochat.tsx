import { FC } from "react";

interface VideoChatProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoChat: FC<VideoChatProps> = ({ videoRef }) => {
  return (
    <div>
      <p>hello im here</p>
      <video width="250" ref={videoRef} autoPlay></video>
    </div>
  );
};

export default VideoChat;
