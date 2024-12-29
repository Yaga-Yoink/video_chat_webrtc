import "./App.css";
import VideoChat from "./videochat.tsx";
import { useState } from "react";

function App() {
  const [startFlag, setStartFlag] = useState(0);
  return (
    <>
      <div className="left">
        <VideoChat startFlag={startFlag} />
      </div>
      <div className="right">
        <button onClick={() => setStartFlag(startFlag + 1)}>Start</button>
      </div>
    </>
  );
}

export default App;
