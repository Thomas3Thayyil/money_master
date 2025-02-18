import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

const Chatbot = () => {
  const [generatedText, setGeneratedText] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  
  // Multiple predefined texts to be prepended to all prompts
  const predef = [
    "Do not use bold text",
    "Do not ever answer point by point. Only paragraphs.",
    "Check if there is a possibility of financial crime. If yes, Make the first line \"POSSIBLE FRAUD DETECTED\" return the crime and why.",
    "If no such possibility exists, give back responses as you normally would and ignore the previous predef",
    "ONLY content no intro. all text should be uniform(no boldening)",
    "IF a crime is detected, add a line \"For more information visit\" with a link leads to a website with more data ONLY IF POSSIBLE. If such a link cannot be provided, do not bother."
  ].join(", ") + ": ";

  const handleGenerateText = async (e) => {
    e.preventDefault();

    try {
      const userMessage = { text: prompt, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const response = await fetch("http://127.0.0.1:5000/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: predef + prompt }), // Concatenating predef with user prompt
      });

      const data = await response.json();
      const botMessage = { text: data.text, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error chatting with Gemini:", error);
      const errorMessage = { text: "Error contacting Gemini.", sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setPrompt("");
  };

  return (
    <div className="chatbot-section">
      <h2>Chatbot</h2>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleGenerateText} className="chat-input-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;