import React, { useState } from "react";
import Plot from "react-plotly.js";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [date, setDate] = useState("");
  const [ticker, setTicker] = useState("");
  const [summary, setSummary] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [actualData, setActualData] = useState([]);

  const handleGenerateText = async (e) => {
    e.preventDefault();

    try {
      // User's message object
      const userMessage = { text: prompt, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Sending the message to the backend
      const response = await fetch("http://127.0.0.1:5000/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      // Get the bot's response
      const data = await response.json();
      const botMessage = { text: data.text, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error chatting with Gemini:", error);
      // Fallback error message if API call fails
      const errorMessage = { text: "Error contacting Gemini.", sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    // Clear the input prompt
    setPrompt("");
  };

  const handleChartSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date }), // Send the selected date
      });
      const data = await response.json();

      // Set the forecast data in the state
      setForecast(data.forecast_data);
      setActualData(data.actual_data);
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  };

  const generateChartData = () => {
    const actualDates = actualData.map((item) => item.date);
    const actualPrices = actualData.map((item) => item.close);
    const forecastDates = forecast.map((item) => item.date);
    const forecastPrices = forecast.map((item) => item.predicted);

    return {
      data: [
        {
          x: actualDates,
          y: actualPrices,
          type: "scatter",
          mode: "lines",
          name: "Actual Stock Prices",
          marker: { color: "blue" },
        },
        {
          x: forecastDates,
          y: forecastPrices,
          type: "scatter",
          mode: "lines",
          name: "Predicted Stock Prices",
          marker: { color: "orange" },
        },
      ],
      layout: {
        title: "Stock Price Prediction for Next 7 Days",
        xaxis: {
          title: "Date",
          type: "category",
        },
        yaxis: {
          title: "Stock Price",
        },
        responsive: true,
      },
    };
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing article:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔥MONEYMASTER🔥</h1>
      </header>
      <div className="content">
        <div className="chart-section">
          <h2>Nifty 50 Prediction</h2>
          <form onSubmit={handleChartSubmit}>
            <label htmlFor="date">Select Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button type="submit">Generate Chart</button>
          </form>
          <div id="chart">
            {/* Show this text only when forecast and actualData are empty */}
            {forecast.length === 0 || actualData.length === 0 ? (
              <p>Chart will appear here:</p>
            ) : (
              <Plot
                data={generateChartData().data}
                layout={generateChartData().layout}
              />
            )}
          </div>
        </div>

        <div className="article-summarizer">
          <h2>Article Summarizer</h2>
          <form onSubmit={handleSummarize}>
            <label htmlFor="ticker">Ticker Symbol:</label>
            <input
              type="text"
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
            <button type="submit">Summarize</button>
          </form>
          <p>{summary}</p>
        </div>
      </div>

      <div className="chatbot-section">
        <h2> Chatbot</h2>
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
            value={prompt} // Use 'prompt' here for the user input
            onChange={(e) => setPrompt(e.target.value)} // Update 'prompt' as user types
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
