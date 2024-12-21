import { useState, useEffect } from "react";
import "./App.css";
import "./localvideochat.tsx";
import LocalVideoChat from "./localvideochat.tsx";
import RemoteVideoChat from "./remotevideochat.tsx";

function App() {
  const [data, setData] = useState("before fetching");
  const [updateTrigger, setUpdateTrigger] = useState(0);

  function handleClick() {
    setUpdateTrigger(updateTrigger + 1);
  }

  useEffect(() => {
    console.log("fetching data");
    fetch("/api")
      .then((data) => data.json())
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Issue getting data", error);
      });
  }, []);

  return (
    <>
      <div className="card">
        <p>{data.toString()}</p>
      </div>
      <button onClick={handleClick}>Next Person</button>
      <LocalVideoChat updateTrigger={updateTrigger} />
      <RemoteVideoChat updateTrigger={updateTrigger} />
    </>
  );
}

export default App;
