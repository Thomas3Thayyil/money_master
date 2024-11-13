// src/Chatbot.js
import React from "react";
import { Chatbot } from "react-chatbot-kit";
import config from "./config"; // Import your chatbot configuration
import actionProvider from "./actionProvider"; // Import your action provider
import messageParser from "./messageParser"; // Import your message parser

const ChatbotComponent = () => {
  return (
    <div>
      <Chatbot
        config={config}
        actionProvider={actionProvider}
        messageParser={messageParser}
      />
    </div>
  );
};

export default ChatbotComponent;
