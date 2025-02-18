import React, { useState } from "react";
import Banner from "./command_bar.js";
import "./App.css";
import Chart from "./chart.js";
import Chatbot from "./chatbot.js";
import Art from "./art_ttt.js";

function Home() {
  const [cont, setCont] = useState(0);

  const renderComponent = () => {
    switch(cont) {
      case 0:
        return <Art />;
      case 1:
        return <Chatbot />;
      case 2:
        return <Chart />;
      default:
        return <Art />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔥 MONEYMASTER 🔥</h1>
      </header>
      <Banner setCont={setCont} />
      {renderComponent()}
    </div>
  );
}

export default Home;