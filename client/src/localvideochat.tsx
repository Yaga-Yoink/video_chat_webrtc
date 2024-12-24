import { useEffect, useRef, FC } from "react";
import VideoChat from "./videochat";

interface VideoChatProps {}

const LocalVideoChat: FC<VideoChatProps> = () => {
  const constraints = { audio: true, video: true };
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
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
  }, []);
  return <VideoChat videoRef={videoRef} updateTrigger={false} />;
};

export default LocalVideoChat;
