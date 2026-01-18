/**
 * ChatHeader Component
 *
 * Header for the chatbot interface showing title and agent information
 */

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
};

const lineDraw = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
};

export function ChatHeader() {
  return (
    <>
      {/* Header */}
      <div className="bg-[#F0EBE0] border-b border-[#2A1B12]/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.h1
            className="font-serif text-2xl font-bold text-[#2A1B12]"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            AI Agent Chat
          </motion.h1>
          <motion.div
            className="flex items-center gap-3 text-sm font-mono text-[#5C4D45]"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3" /> Orchestrator
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <span className="text-purple-600 font-bold">اردو</span> Specialist
            </span>
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
    </>
  );
}