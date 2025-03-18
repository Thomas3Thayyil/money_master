// Home.js
import React, { useState, useContext } from "react";
import Banner from "./command_bar.js";
import "./style/app.css";
import Chart from "./chart.js";
import Chatbot from "./chatbot.js";
import Art from "./art_ttt.js";
import UserForm from "./UserForm";
import { MoneyMasterContext } from "./context";

function Home() {
  const [cont, setCont] = useState(0);
  const { userData } = useContext(MoneyMasterContext);

  // Check if user details have been provided (using name as indicator)
  const isUserDetailsProvided = userData.name.trim() !== "";

  const renderComponent = () => {
    switch (cont) {
      case 0:
        return (
          <div className="art-section">
            <Art />
          </div>
        );
      case 1:
        return <Chatbot />;
      case 2:
        return <Chart />;
      default:
        return (
          <div className="art-section">
            <Art />
          </div>
        );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ paddingTop: 6 }}> MONEYMASTER </h1>
      </header>
      {!isUserDetailsProvided ? (
        <UserForm />
      ) : (
        <>
          {renderComponent()}
          <Banner setCont={setCont} className="Banner" />
        </>
      )}
    </div>
  );
}

export default Home;
