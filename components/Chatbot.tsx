"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UserProfile {
  skin_type_self?: string;
  sensitivity?: string;
  goal?: string;
  skin_history?: string;
  // additional fields from questionnaire
  t_zone_oiliness?: string;
  pore_size?: string;
  acne_level?: string;
  hydration?: string;
}

interface ChatbotProps {
  userId: string;
  userProfile: UserProfile | null;
}

const CHATBOT_PROMPT = (profile: UserProfile) => `你是 SkinSense 的 AI 護膚助理。根據用戶的皮膚資料回答問題。

用戶皮膚：
- 皮膚類型：${profile.skin_type_self || "未填寫"}
- 敏感程度：${profile.sensitivity || "未填寫"}
- T區油脂：${profile.t_zone_oiliness || "未填寫"}
- 毛孔大小：${profile.pore_size || "未填寫"}
- 痘痘程度：${profile.acne_level || "未填寫"}
- 缺水情況：${profile.hydration || "未填寫"}
- 目標：${profile.goal || "未填寫"}
- 皮膚/過敏史：${profile.skin_history || "無"}

規則：
- 用繁體中文
- 適合香港/台灣讀者
- 專業但易讀
- 如果涉及醫療，建議就醫
- 不要推薦特定品牌
- 回答簡潔，不超過 200 字`;

export default function Chatbot({ userId, userProfile }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          userId,
          userProfile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "抱歉，發生錯誤。請稍後再試。",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "抱歉，網絡連接失敗。請稍後再試。",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-skin-600 text-white shadow-lg transition-all hover:bg-skin-700 hover:scale-105"
        aria-label="開啟 AI 護膚助理"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "480px", maxHeight: "calc(100vh - 8rem)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-skin-600 px-4 py-3 text-white">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-semibold">AI 護膚助理</h3>
              <p className="text-xs text-skin-100">根據您的皮膚檔案提供建議</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded-lg p-1 hover:bg-skin-500 transition-colors"
              aria-label="關閉"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <span className="text-4xl mb-3">👋</span>
                <p className="text-sm mb-1">嗨！我是 SkinSense AI 助理</p>
                <p className="text-xs">可以問我關於護膚的問題~</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-skin-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="問我任何護膚問題..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skin-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-skin-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-skin-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                發送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
