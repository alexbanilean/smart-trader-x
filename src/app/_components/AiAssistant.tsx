'use client';

import React, { useState } from "react";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: Message = { text: trimmedInput, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOURAPIKEY`, // Pune cheia aici
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful financial assistant." },
            ...[...messages, userMessage].map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          ],
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "Assistant Mock Response";
      const botMessage: Message = { text: content, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      const botMessage: Message = { text: "Assistant Mock Response", sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full p-6 font-sans bg-gray-50">
      {/* Insight Box */}
      <div className="mb-4 max-w-md">
        <div className="bg-gray-100 text-sm p-4 rounded-xl shadow">
          <p><strong>Apple Inc. (AAPL)</strong> is currently trading at $187.60, down 0.45% today.</p>
          <p className="mt-2 font-semibold">🔍 Key Insights:</p>
          <ul className="list-disc list-inside mt-1">
            <li>P/E Ratio: 29.3 (above sector avg)</li>
            <li>Analyst Sentiment: 67% Buy</li>
            <li>Recent News: Apple announces new AI features at WWDC</li>
            <li>Technical Indicator: RSI at 62 (neutral to slightly overbought)</li>
          </ul>
          <p className="mt-2">Would you like a forecast or see similar tech stocks?</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 w-full px-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded-md text-sm max-w-md ${
              msg.sender === "user" ? "bg-blue-100 ml-auto text-right" : "bg-gray-200 mr-auto text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="mt-auto w-full px-4">
        <div className="flex items-center border rounded-md p-2 w-full bg-white">
          <input
            type="text"
            placeholder="Type in your message here:"
            className="flex-1 px-3 py-2 rounded outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="ml-2 px-3 py-2 rounded hover:bg-gray-200"
            style={{ backgroundColor: "#e5e7eb", color: "#333" }}
          >
            &#10148;
          </button>
        </div>

        {/* Prompt Suggestions */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4 text-sm w-full">
          <div
            className="flex-1 border rounded-md p-2 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => setInputValue("What is the market sentiment on the most recent AAPL earnings call?")}
          >
            What is the market sentiment on the most recent AAPL earnings call?
          </div>
          <div
            className="flex-1 border rounded-md p-2 text-center cursor-pointer bg-blue-100 hover:bg-blue-200"
            onClick={() => setInputValue("What are the risks of buying Nvidia this quarter?")}
          >
            What are the risks of buying Nvidia this quarter?
          </div>
        </div>
      </div>
    </div>
  );
};