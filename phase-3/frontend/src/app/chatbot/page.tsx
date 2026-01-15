/**
 * Chatbot Page
 *
 * Main interface for AI agent chat with dual-agent support (Orchestrator + UrduSpecialist)
 * Features: Real-time messaging, agent attribution, tool call indicators, error handling
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/hooks";
import { getJwtToken } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Send, User, Bot, Toolbox, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  agentName?: "Orchestrator" | "UrduSpecialist";
  timestamp: string;
  toolCalls?: ToolCall[];
  loading?: boolean;
  error?: string;
}

interface ToolCall {
  tool_name: string;
  arguments: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
}

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    agent: string;
    timestamp: string;
    tool_calls: ToolCall[];
  };
  error?: string;
  type?: string;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
};

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
};

const lineDraw = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
};

export default function ChatbotPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessage = useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: async (request) => {
      // Get JWT token from Better Auth
      const token = await getJwtToken();

      if (!token) {
        throw new Error("Authentication required - please sign in");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onMutate: (variables) => {
      // Add optimistic user message
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: variables.message,
        timestamp: new Date().toISOString(),
      };

      // Add loading agent message
      const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        role: "agent",
        content: "Thinking...",
        timestamp: new Date().toISOString(),
        loading: true,
      };

      setMessages((prev) => [...prev, userMessage, loadingMessage]);
    },
    onSuccess: (data) => {
      // Remove loading message
      setMessages((prev) => prev.filter((m) => !m.loading));

      if (data.success && data.data) {
        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: data.data.message,
          agentName: data.data.agent as "Orchestrator" | "UrduSpecialist",
          timestamp: data.data.timestamp,
          toolCalls: data.data.tool_calls,
        };

        setMessages((prev) => [...prev, agentMessage]);
      } else {
        // Handle error
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "agent",
          content: "Sorry, there was an error processing your request.",
          timestamp: new Date().toISOString(),
          error: data.error || "Unknown error",
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    onError: (error) => {
      // Remove loading message and add error
      setMessages((prev) => prev.filter((m) => !m.loading));

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "agent",
        content: "Failed to send message. Please check your connection.",
        timestamp: new Date().toISOString(),
        error: error.message,
      };

      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || sendMessage.isPending) return;

    sendMessage.mutate({ message: inputValue.trim() });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Just now";
    }
  };

  // Get agent icon
  const getAgentIcon = (agentName?: string) => {
    if (agentName === "Orchestrator") {
      return <Bot className="w-4 h-4 text-blue-500" />;
    } else if (agentName === "UrduSpecialist") {
      return <span className="text-sm font-bold text-purple-500">اردو</span>;
    }
    return <Bot className="w-4 h-4 text-gray-500" />;
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[#F9F7F2] flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#F0EBE0] border-b border-[#2A1B12]/10 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.h1
            className="font-serif text-xl md:text-2xl font-bold text-[#2A1B12]"
            variants={fadeInUp}
          >
            AI Agent Chat
          </motion.h1>
          <motion.div
            className="hidden md:flex items-center gap-3 text-sm font-mono text-[#5C4D45]"
            variants={fadeInUp}
          >
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3" /> Orchestrator
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <span className="text-purple-600 font-bold">اردو</span> Specialist
            </span>
          </motion.div>
          {/* Mobile badge */}
          <motion.div
            className="md:hidden flex items-center gap-2 text-xs font-mono text-[#5C4D45]"
            variants={fadeInUp}
          >
            <Bot className="w-3 h-3" />
            <span className="text-purple-600 font-bold">اردو</span>
          </motion.div>
        </div>
      </div>

      {/* Technical divider */}
      <motion.div
        className="h-px bg-[#2A1B12]/10"
        variants={lineDraw}
        initial="initial"
        animate="animate"
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                variants={fadeInUp}
                className="text-center py-12 text-[#5C4D45]"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Bot className="w-6 h-6 text-[#FF6B4A]" />
                  <span className="font-serif text-xl">Welcome</span>
                </div>
                <p className="font-mono text-sm">
                  Start a conversation with our dual-agent system
                </p>
                <p className="font-mono text-xs mt-2 opacity-60">
                  Try: "Create a task for tomorrow" or "میرا نام کیا ہے؟"
                </p>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Agent Avatar */}
                {message.role === "agent" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0EBE0] border border-[#2A1B12]/10 flex items-center justify-center">
                    {getAgentIcon(message.agentName)}
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`max-w-[85%] md:max-w-[75%] px-3 md:px-4 py-2 md:py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#FF6B4A] text-white font-sans"
                      : "bg-[#F0EBE0] text-[#2A1B12] border border-[#2A1B12]/10"
                  }`}
                >
                  {/* Agent Attribution */}
                  {message.role === "agent" && message.agentName && (
                    <div className="flex items-center gap-2 mb-2 text-xs font-mono opacity-70">
                      {getAgentIcon(message.agentName)}
                      <span>{message.agentName}</span>
                    </div>
                  )}

                  {/* Loading State */}
                  {message.loading && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-mono text-sm">Thinking...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {message.error && (
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-mono text-sm">{message.content}</p>
                        <p className="font-mono text-xs opacity-60 mt-1">
                          Error: {message.error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Normal Content */}
                  {!message.loading && !message.error && (
                    <p className="font-sans text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}

                  {/* Tool Calls */}
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.toolCalls.map((tool, idx) => (
                        <div
                          key={idx}
                          className="bg-[#2A1B12]/5 rounded p-2 border border-[#2A1B12]/10"
                        >
                          <div className="flex items-center gap-2 text-xs font-mono mb-1">
                            <Toolbox className="w-3 h-3 text-[#FF6B4A]" />
                            <span className="font-bold">{tool.tool_name}</span>
                            <CheckCircle2 className="w-3 h-3 text-green-600 ml-auto" />
                          </div>
                          <div className="text-[10px] font-mono opacity-70">
                            {Object.keys(tool.arguments).length > 0 && (
                              <div className="mb-1">
                                Args: {JSON.stringify(tool.arguments, null, 0)}
                              </div>
                            )}
                            {tool.result && (
                              <div className="text-green-700">
                                Result: {JSON.stringify(tool.result, null, 0)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] font-mono mt-2 opacity-60 ${
                      message.role === "user" ? "text-white/80" : "text-[#5C4D45]"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {/* User Avatar */}
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center font-mono text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Technical divider */}
      <motion.div
        className="h-px bg-[#2A1B12]/10"
        variants={lineDraw}
        initial="initial"
        animate="animate"
      />

      {/* Quick Actions */}
      <div className="bg-[#F9F7F2] border-t border-[#2A1B12]/10 px-4 md:px-6 py-2 md:py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2">
            <span className="text-xs font-mono text-[#5C4D45] mr-1 whitespace-nowrap">Quick:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Create a task for tomorrow called Buy groceries")}
              disabled={!user || sendMessage.isPending}
              className="text-xs font-mono px-2 md:px-3 py-1 bg-[#F0EBE0] border-[#2A1B12]/20 hover:bg-[#FF6B4A] hover:text-white hover:border-[#FF6B4A] transition-colors whitespace-nowrap"
            >
              Create Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Show me my pending tasks")}
              disabled={!user || sendMessage.isPending}
              className="text-xs font-mono px-2 md:px-3 py-1 bg-[#F0EBE0] border-[#2A1B12]/20 hover:bg-[#FF6B4A] hover:text-white hover:border-[#FF6B4A] transition-colors whitespace-nowrap"
            >
              List Tasks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("میرا نام کیا ہے؟")}
              disabled={!user || sendMessage.isPending}
              className="text-xs font-mono px-2 md:px-3 py-1 bg-[#F0EBE0] border-[#2A1B12]/20 hover:bg-[#FF6B4A] hover:text-white hover:border-[#FF6B4A] transition-colors whitespace-nowrap"
            >
              Urdu Test
            </Button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#F0EBE0] border-t border-[#2A1B12]/10 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                user
                  ? "Type your message... (Try: 'Create a task for tomorrow' or 'میرا نام کیا ہے؟')"
                  : "Please sign in to use the chatbot"
              }
              disabled={!user || sendMessage.isPending}
              className="flex-1 bg-[#F9F7F2] border-[#2A1B12]/20 focus:border-[#FF6B4A] font-mono text-sm"
            />

            <Button
              type="submit"
              disabled={!inputValue.trim() || !user || sendMessage.isPending}
              className="bg-[#FF6B4A] hover:bg-[#E55A3D] text-white px-4 md:px-6 py-2 font-mono text-sm uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Status Info / System Footer */}
          <div className="flex items-center justify-between mt-3 text-xs font-mono text-[#5C4D45]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                {user ? "Authenticated" : "Signed out"}
              </span>
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Orchestrator + UrduSpecialist
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                MCP Tools Active
              </span>
            </div>
            {sendMessage.isPending && (
              <span className="flex items-center gap-1 text-[#FF6B4A]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}