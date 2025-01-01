import { FC } from "react";
import "./textchat.css";

interface TextChatProps {
  onButtonClick: any;
  sendMessage: any;
  buttonState: string;
}

const TextChat: FC<TextChatProps> = ({
  onButtonClick,
  buttonState,
  sendMessage,
}) => {
  return (
    <>
      <div className="chat"></div>
      <div className="bottom_bar">
        <button className="connect_button" onClick={onButtonClick}>
          {buttonState}
        </button>
        <textarea
          form="text_form"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const textarea = event.target as HTMLTextAreaElement;
              sendMessage(textarea.value);
              textarea.value = "";
            }
          }}
          className="user_message"
        ></textarea>
      </div>
    </>
  );
};

export default TextChat;
