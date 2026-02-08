/**
 * ChatInput Component
 *
 * Input component for sending messages to the agent system
 */

import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  authenticated?: boolean;
}

const lineDraw = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  disabled = false,
  loading = false,
  authenticated = true,
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && !loading && authenticated) {
      onSubmit();
    }
  };

  return (
    <div className="bg-[#F0EBE0] border-t border-[#2A1B12]/10 px-6 py-4">
      <motion.div
        className="h-px bg-[#2A1B12]/10 mb-4"
        variants={lineDraw}
        initial="initial"
        animate="animate"
      />

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={
              authenticated
                ? "Type your message... (Try: 'Create a task for tomorrow' or 'میرا نام کیا ہے؟')"
                : "Please sign in to use the chatbot"
            }
            disabled={disabled || !authenticated}
            className="flex-1 bg-[#F9F7F2] border-[#2A1B12]/20 focus:border-[#FF6B4A] font-mono text-sm transition-colors"
          />

          <Button
            type="submit"
            disabled={!value.trim() || disabled || !authenticated || loading}
            className="bg-[#FF6B4A] hover:bg-[#E55A3D] text-white px-6 py-2 font-mono text-sm uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>

        {/* Status Info */}
        <div className="flex items-center justify-between mt-3 text-xs font-mono text-[#5C4D45]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  authenticated ? "bg-green-600" : "bg-red-500"
                }`}
              />
              {authenticated ? "Authenticated" : "Signed out"}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Dual-agent system
            </span>
          </div>
          {loading && (
            <span className="flex items-center gap-1 text-[#FF6B4A]">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}