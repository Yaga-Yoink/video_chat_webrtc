import { FC } from "react";
import VideoChat from "./videochat";

interface VideoChatProps {
  remoteVideoRef: React.MutableRefObject<HTMLVideoElement | null>;
  updateTrigger: boolean;
}

const RemoteVideoChat: FC<VideoChatProps> = ({
  remoteVideoRef,
  updateTrigger,
}) => {
  return <VideoChat videoRef={remoteVideoRef} updateTrigger={updateTrigger} />;
};

export default RemoteVideoChat;
