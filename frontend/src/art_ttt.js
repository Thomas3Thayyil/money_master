import React, { useState, useEffect } from "react";
import "./App.css";

function Art() {
    const [response, setResponse] = useState({ messagehead: [], messagebody: [] });
    const [expandedIndex, setExpandedIndex] = useState(null);

    const art_create = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/art_create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            setResponse(data);
        } catch (error) {
            console.error("Error generating art:", error);
        }
    };

    useEffect(() => {
        art_create();
    }, []);

    const toggleItem = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const renderItem = (index) => {
        const isExpanded = expandedIndex === index;
        return (
            <div 
                className={`item ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleItem(index)}
                key={index}
            >
                <h3>{response.messagehead[index] || "No message generated yet."}</h3>
                <div className={`details ${isExpanded ? 'show' : ''}`}>
                    {response.messagebody[index] || "No message generated yet."}
                </div>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="scrollable-container">
                {[0, 1, 2, 3, 4].map(index => renderItem(index))}
            </div>
        </div>
    );
}

export default Art;