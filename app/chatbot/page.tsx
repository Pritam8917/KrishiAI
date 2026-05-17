"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, Sprout, X } from "lucide-react";
import axios from "axios";
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello 👋 I am KrishiAI, your smart farming assistant. Ask me any farming-related question.",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  // Send Message
  const sendMessage = async () => {
    if (!message.trim()) return;
    const currentMessage = message;
    const userMessage = {
      role: "user" as const,
      content: currentMessage,
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        message: currentMessage,
      });

      const data = await res.data;
      const aiMessage = {
        role: "assistant" as const,
        content: data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    }

    setLoading(false);
  };

  // Suggested Questions
  const suggestions = [
    "How to increase rice production?",
    "Best fertilizer for wheat?",
    "How to prevent leaf disease?",
  ];

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-100 group">
          {/* Tooltip */}
          <div className=" absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg pointer-events-none">
            Ask KrishiAI 🌱
          </div>

          {/* Floating Button */}
          <button
            onClick={() => setOpen(true)}
            className=" w-16 h-16 rounded-full bg-linear-to-r from-green-600 to-emerald-500 hover:scale-110 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.25)] flex items-center justify-center text-white cursor-pointer"
          >
            <MessageCircle size={28} />
          </button>
        </div>
      )}

      {/* Chat Window */}
      <div
        className={` fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-95 md:w-100 h-[75vh] sm:h-162.5 max-h-[90vh] rounded-3xl overflow-hidden border border-white/20 bg-white/80 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.20)] flex flex-col transition-all duration-300
      ${
        open
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      }
      `}
      >
        {/* Header */}
        <div className=" bg-linear-to-r from-green-600 to-emerald-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className=" w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
              <Sprout size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg">KrishiAI Assistant</h2>
              <p className="text-sm text-green-100">Smart Farming AI</p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className=" hover:bg-white/20 p-1 rounded-md transition cursor-pointer border-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className=" flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y p-4 bg-linear-to-b from-green-50 to-white space-y-4 scroll-smooth">
          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Suggested Questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(item)}
                    className=" text-sm bg-white border px-4 py-2 rounded-full hover:bg-green-100 transition cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div className=" w-9 h-9 rounded-full bg-linear-to-r from-green-600 to-emerald-500 text-white flex items-center justify-center mr-2 mt-1 shadow">
                  <Sprout size={16} />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={` max-w-[78%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm leading-relaxed
                  ${
                    msg.role === "user"
                      ? ` bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-br-sm`
                      : ` bg-white border border-gray-200 text-gray-700 rounded-tl-sm`
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex items-start">
              <div className=" w-9 h-9 rounded-full bg-linear-to-r from-green-600 to-emerald-500 text-white flex items-center justify-center mr-2">
                <Sprout size={16} />
              </div>
              <div className=" bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className=" border-t border-gray-200 bg-white/80 backdrop-blur-lg p-3">
          <div className=" flex items-center gap-2 bg-gray-100 rounded-full px-2 py-2">
            <input
              type="text"
              placeholder="Ask your farming question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className=" flex-1 bg-transparent outline-none px-3 text-sm"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className=" w-11 h-11 rounded-full bg-linear-to-r from-green-600 to-emerald-500 hover:scale-105 disabled:opacity-50 transition-all text-white flex items-center justify-center shadow-lg cursor-pointer"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
