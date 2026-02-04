/**
 * MessageBubble Component
 *
 * Individual message bubble with agent attribution, tool calls, and timestamps
 */

import { motion } from "framer-motion";
import { Bot, User, Toolbox, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { ReactNode } from "react";

export interface ToolCall {
  tool_name: string;
  arguments: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  agentName?: "Orchestrator" | "UrduSpecialist";
  timestamp: string;
  toolCalls?: ToolCall[];
  loading?: boolean;
  error?: string;
}

interface MessageBubbleProps {
  message: Message;
  userName?: string;
  index: number;
}

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: 0.05 }
  }
};

export function MessageBubble({ message, userName = "User", index }: MessageBubbleProps) {
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

  const getAgentIcon = (agentName?: string): ReactNode => {
    if (agentName === "Orchestrator") {
      return <Bot className="w-4 h-4 text-blue-500" />;
    } else if (agentName === "UrduSpecialist") {
      return <span className="text-sm font-bold text-purple-500">اردو</span>;
    }
    return <Bot className="w-4 h-4 text-gray-500" />;
  };

  const getAvatar = (): ReactNode => {
    if (message.role === "user") {
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center font-mono text-xs font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
      );
    }

    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0EBE0] border border-[#2A1B12]/10 flex items-center justify-center">
        {getAgentIcon(message.agentName)}
      </div>
    );
  };

  const getContainerClasses = (): string => {
    if (message.role === "user") {
      return "bg-[#FF6B4A] text-white font-sans";
    }
    if (message.error) {
      return "bg-red-50 text-red-900 border border-red-200";
    }
    return "bg-[#F0EBE0] text-[#2A1B12] border border-[#2A1B12]/10";
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      layout
      className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar */}
      {message.role === "agent" && getAvatar()}

      {/* Content */}
      <div className={`max-w-[75%] px-4 py-3 rounded-lg ${getContainerClasses()}`}>
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
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
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
          <p className="font-sans text-sm whitespace-pre-wrap leading-relaxed">
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
                <div className="text-[10px] font-mono opacity-70 space-y-1">
                  {Object.keys(tool.arguments).length > 0 && (
                    <div className="text-[#5C4D45]">
                      <span className="opacity-60">Args:</span>{" "}
                      {JSON.stringify(tool.arguments, null, 0)}
                    </div>
                  )}
                  {tool.result && (
                    <div className="text-green-700">
                      <span className="opacity-60">Result:</span>{" "}
                      {JSON.stringify(tool.result, null, 0)}
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

      {/* User Avatar (right side) */}
      {message.role === "user" && getAvatar()}
    </motion.div>
  );
}