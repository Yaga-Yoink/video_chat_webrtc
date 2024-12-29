import { FC } from "react";
import "./textchat.css";

interface TextChatProps {
  onButtonClick: any;
}

const TextChat: FC<TextChatProps> = ({ onButtonClick }) => {
  return (
    <>
      <div className="chat"></div>
      <div className="bottom_bar">
        <button className="connect_button" onClick={onButtonClick}>
          Connect
        </button>
        <input className="user_message" type="text"></input>
      </div>
    </>
  );
};

export default TextChat;
