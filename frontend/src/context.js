import React, { createContext, useState } from "react";

export const MoneyMasterContext = createContext();

export const MoneyMasterProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: "",
    salary: "",
    expenses: "",
  });

  const [globalNews, setGlobalNews] = useState(null); // Save news data
  const [chatHistory, setChatHistory] = useState([]); // Store chat history

  return (
    <MoneyMasterContext.Provider
      value={{
        userData,
        setUserData,
        globalNews,
        setGlobalNews,
        chatHistory,
        setChatHistory,
      }}
    >
      {children}
    </MoneyMasterContext.Provider>
  );
};
