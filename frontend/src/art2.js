import React, { useState, useEffect } from 'react';

const Art2 = () => {
  const [stockName, setStockName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch ticker suggestions from the API
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/get-tickers");
        if (!response.ok) {
          throw new Error("Failed to fetch tickers");
        }
        const data = await response.json();
        if (data.tickers) {
          setSuggestions(data.tickers);
        }
      } catch (err) {
        console.error("Error fetching tickers:", err);
      }
    };
    fetchTickers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stockName.trim()) return;
    setLoading(true);
    try {
      // Build your prompt for Groq API
      const prompt = `Summarize recent news articles about ${stockName}. Provide key bullet points.`;
      const response = await fetch("http://127.0.0.1:5000/generate-text_gorq", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }
      const data = await response.json();
      // Assuming data.text is a newline-separated string of bullet points
      const summaryPoints = data.text
        .split('\n')
        .map(point => point.trim())
        .filter(point => point !== "");
      setSummaries(summaryPoints);
    } catch (error) {
      console.error("Error fetching summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Article Summarizer</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={stockName}
          onChange={(e) => setStockName(e.target.value)}
          placeholder="Enter stock ticker..."
          style={styles.input}
          list="ticker-suggestions"
        />
        {/* Datalist to show ticker suggestions */}
        <datalist id="ticker-suggestions">
          {suggestions.map((ticker, index) => (
            <option key={index} value={ticker} />
          ))}
        </datalist>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Generating summary...' : 'Summarize'}
        </button>
      </form>
      <div style={styles.bubbleContainer}>
        {summaries.map((summary, index) => (
          <div key={index} style={styles.bubble}>
            {summary}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  button: {
    padding: '10px 20px',
    marginLeft: '10px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  bubbleContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    flex: '1 1 calc(50% - 10px)',
    minWidth: '250px'
  }
};

export default Art2;