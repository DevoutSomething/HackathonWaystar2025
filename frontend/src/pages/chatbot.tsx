import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const navigate = useNavigate();

  // Check if risk assessment has been completed
  useEffect(() => {
    const riskAssessment = localStorage.getItem("riskAssessment");
    if (!riskAssessment) {
      alert(
        "Please complete the risk assessment first before using the chatbot."
      );
      navigate("/input");
    }
  }, [navigate]);

  // Load conversation history from localStorage
  const loadMessages = (): Message[] => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
    return [
      {
        role: "assistant",
        content:
          "Hello! I'm Tatum, your software management assistant. I can help you understand your project risk assessment and provide insights to minimize delays. What would you like to know?",
        timestamp: new Date(),
      },
    ];
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages());
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save conversation history whenever messages change
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get stored data from localStorage
      const storedJiraData = localStorage.getItem("jiraData");
      const storedRiskAssessment = localStorage.getItem("riskAssessment");
      const storedFormInputs = localStorage.getItem("formInputs");

      const response = await fetch("http://localhost:5001/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          jira_data: storedJiraData ? JSON.parse(storedJiraData) : {},
          risk_assessment: storedRiskAssessment
            ? JSON.parse(storedRiskAssessment)
            : {},
          form_inputs: storedFormInputs ? JSON.parse(storedFormInputs) : {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. Please make sure the backend server is running and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      const initialMessage: Message = {
        role: "assistant",
        content:
          "Hello! I'm Tatum, your software management assistant. I can help you understand your project risk assessment and provide insights to minimize delays. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      localStorage.setItem("chatHistory", JSON.stringify([initialMessage]));
    }
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-[#0a0a0a] ml-64 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-white"
                  >
                    <path
                      d="M17 9C17 12.866 13.866 16 10 16C9 16 8 15.8 7.2 15.4L3 17L4.6 12.8C4.2 12 4 11 4 10C4 6.134 7.134 3 11 3C14.866 3 17 5.134 17 9Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle cx="8" cy="9" r="0.5" fill="currentColor" />
                    <circle cx="10.5" cy="9" r="0.5" fill="currentColor" />
                    <circle cx="13" cy="9" r="0.5" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Chat with Tatum
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Your AI software management assistant
                  </p>
                </div>
              </div>
              <Button
                onClick={clearHistory}
                variant="outline"
                className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              >
                Clear History
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                )}
                <Card
                  className={`max-w-[70%] ${
                    message.role === "user"
                      ? "bg-orange-600 border-orange-600"
                      : "bg-[#111111] border-gray-800"
                  }`}
                >
                  <div className="p-4">
                    <p
                      className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        message.role === "user" ? "text-white" : "text-gray-200"
                      }`}
                    >
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-orange-200"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Card>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-gray-300"
                    >
                      <path
                        d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                        fill="currentColor"
                      />
                      <path
                        d="M3 14C3 11.7909 4.79086 10 7 10H9C11.2091 10 13 11.7909 13 14V14H3V14Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <Card className="bg-[#111111] border-gray-800">
                  <div className="p-4 flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your project risk or management strategies..."
                className="flex-1 bg-[#111111] border-gray-800 text-white placeholder:text-gray-500 focus:border-orange-500"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M3 10L17 10M17 10L11 4M17 10L11 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
