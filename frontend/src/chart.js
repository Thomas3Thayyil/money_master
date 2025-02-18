import React, { useState } from "react";
import Plot from "react-plotly.js";
import "./App.css";

const Chart = () => {
  const [date, setDate] = useState("");
  const [forecast, setForecast] = useState([]);
  const [actualData, setActualData] = useState([]);

  const handleChartSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = await response.json();

      setForecast(data.forecast_data || []);
      setActualData(data.actual_data || []);
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  };

  const generateChartData = () => {
    if (!Array.isArray(actualData) || !Array.isArray(forecast)) {
      return { data: [], layout: {} };
    }

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

  return (
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
  );
};

export default Chart;