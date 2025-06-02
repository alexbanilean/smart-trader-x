"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const chatMutation = api.ai.chat.useMutation({
    onSuccess: (data) => {
      const content =
        data?.choices?.[0]?.message?.content ??
        "Sorry, I couldn't process that request.";
      const botMessage: Message = { text: content, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: (error) => {
      console.error("Error in AI chat:", error);
      const botMessage: Message = {
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    },
  });

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: Message = { text: trimmedInput, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    chatMutation.mutate({
      messages: [...messages, userMessage].map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
    });
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 p-6 font-sans">
      {/* Insight Box */}
      <div className="mb-4 max-w-md">
        <div className="rounded-xl bg-gray-100 p-4 text-sm shadow">
          <p>
            <strong>Apple Inc. (AAPL)</strong> is currently trading at $187.60,
            down 0.45% today.
          </p>
          <p className="mt-2 font-semibold">🔍 Key Insights:</p>
          <ul className="mt-1 list-inside list-disc">
            <li>P/E Ratio: 29.3 (above sector avg)</li>
            <li>Analyst Sentiment: 67% Buy</li>
            <li>Recent News: Apple announces new AI features at WWDC</li>
            <li>
              Technical Indicator: RSI at 62 (neutral to slightly overbought)
            </li>
          </ul>
          <p className="mt-2">
            Would you like a forecast or see similar tech stocks?
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="mb-4 w-full flex-1 overflow-y-auto px-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 max-w-md rounded-md p-2 text-sm ${
              msg.sender === "user"
                ? "ml-auto bg-blue-100 text-right"
                : "mr-auto bg-gray-200 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="mt-auto w-full px-4">
        <div className="flex w-full items-center rounded-md border bg-white p-2">
          <input
            type="text"
            placeholder="Type in your message here:"
            className="flex-1 rounded px-3 py-2 outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="ml-2 rounded px-3 py-2 hover:bg-gray-200"
            style={{ backgroundColor: "#e5e7eb", color: "#333" }}
          >
            &#10148;
          </button>
        </div>

        {/* Prompt Suggestions */}
        <div className="mt-4 flex w-full flex-col gap-4 text-sm sm:flex-row">
          <div
            className="flex-1 cursor-pointer rounded-md border p-2 text-center hover:bg-gray-50"
            onClick={() =>
              setInputValue(
                "What is the market sentiment on the most recent AAPL earnings call?",
              )
            }
          >
            What is the market sentiment on the most recent AAPL earnings call?
          </div>
          <div
            className="flex-1 cursor-pointer rounded-md border bg-blue-100 p-2 text-center hover:bg-blue-200"
            onClick={() =>
              setInputValue("What are the risks of buying Nvidia this quarter?")
            }
          >
            What are the risks of buying Nvidia this quarter?
          </div>
        </div>
      </div>
    </div>
  );
};
