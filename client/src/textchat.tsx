import { FC } from "react";
import "./textchat.css";

interface TextChatProps {
  onButtonClick: any;
  buttonState: string;
}

const TextChat: FC<TextChatProps> = ({ onButtonClick, buttonState }) => {
  return (
    <>
      <div className="chat"></div>
      <div className="bottom_bar">
        <button className="connect_button" onClick={onButtonClick}>
          {buttonState}
        </button>
        <input className="user_message" type="text"></input>
      </div>
    </>
  );
};

export default TextChat;
