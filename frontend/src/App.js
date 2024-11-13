import React, { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setGeneratedText(data.text);
      console.log(generatedText);
    } catch (error) {
      console.error("Error generating text:", error);
    }
  };

  return (
    <div>
      <header className="App-header">
        <h1>🔥MONEYMASTER🔥</h1>
      </header>

      <h1>Gemini Text Generator</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt">Prompt:</label>
        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="submit">Generate</button>
      </form>
      <p>{generatedText}</p>
    </div>
  );
}

export default App;
