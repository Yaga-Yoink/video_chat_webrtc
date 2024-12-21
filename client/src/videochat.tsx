import { useRef, useEffect, FC } from "react";

interface VideoChatProps {
  updateTrigger: number;
}

const VideoChat: FC<VideoChatProps> = ({ updateTrigger }) => {
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
  }, [updateTrigger]);
  return (
    <div>
      <p>hello im here</p>
      <video controls width="250" ref={videoRef} autoPlay></video>
    </div>
  );
};

export default VideoChat;
