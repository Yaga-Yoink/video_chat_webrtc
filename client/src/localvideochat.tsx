import { useEffect, useRef, FC } from "react";
import VideoChat from "./videochat";

interface VideoChatProps {
  updateTrigger: number;
}

const LocalVideoChat: FC<VideoChatProps> = ({ updateTrigger }) => {
  const constraints = { audio: true, video: true };
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (updateTrigger != 0) {
      navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      });
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop);
        }
      };
    }
  }, [updateTrigger]);
  return <VideoChat videoRef={videoRef} />;
};

export default LocalVideoChat;
