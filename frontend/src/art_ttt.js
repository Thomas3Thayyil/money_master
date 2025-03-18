import React, { useState, useEffect, useContext } from "react";
import { MoneyMasterContext } from "./context";
import ReactMarkdown from "react-markdown";
import "./style/app.css";
import "./style/art.css";

function Art() {
  const { userData, globalNews, setGlobalNews } =
    useContext(MoneyMasterContext);
  const [personalAdvice, setPersonalAdvice] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Fetch news only if it's not stored in context
  useEffect(() => {
    if (!globalNews) {
      fetchGlobalNews();
    }
    fetchPersonalAdvice();
  }, [userData]);

  const fetchGlobalNews = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/art_create_gorq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setGlobalNews({
        messagehead: data.messagehead || [],
        messagebody: data.messagebody || [],
      });
    } catch (error) {
      console.error("Error fetching global news:", error);
    }
  };

  const fetchPersonalAdvice = async () => {
    try {
      const prompt = `Given that you earn $${userData.salary} per month and have expenses of $${userData.expenses}, provide personalized financial advice in markdown format.`;
      const res = await fetch("http://127.0.0.1:5000/generate-text_gorq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setPersonalAdvice(data.text || "No advice generated.");
    } catch (error) {
      console.error("Error fetching personalized advice:", error);
      setPersonalAdvice("Error fetching personalized advice.");
    }
  };

  const toggleItem = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="art-container">
      <div className="personal-advice-box">
        <div className="box-header">
          <h2>Personalized Financial Advice</h2>
        </div>
        <div className="advice-content">
          {personalAdvice ? (
            <ReactMarkdown>{personalAdvice}</ReactMarkdown>
          ) : (
            "Loading personalized advice..."
          )}
        </div>
      </div>
      <div className="global-news-box">
        <div className="box-header">
          <h2>Global Financial News</h2>
        </div>
        <div className="news-content">
          {globalNews ? (
            globalNews.messagehead.map((title, index) => (
              <div
                className="item"
                key={index}
                onClick={() => toggleItem(index)}
              >
                <h3>{title}</h3>
                <div
                  className={`details ${expandedIndex === index ? "show" : ""}`}
                >
                  {globalNews.messagebody[index]}
                </div>
              </div>
            ))
          ) : (
            <p>Loading global news...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Art;
