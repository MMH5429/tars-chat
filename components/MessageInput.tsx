"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTyping } from "@/hooks/useTyping";
import { Send } from "lucide-react";

interface MessageInputProps {
  conversationId: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const { onType, stopTyping } = useTyping(conversationId);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    stopTyping();

    try {
      await sendMessage({ conversationId, content: trimmed });
      setContent("");
      inputRef.current?.focus();
    } catch {
      setError("Failed to send. Tap to retry.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onType();
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div className="p-3 border-t border-gray-800">
      {error && (
        <button
          onClick={handleSend}
          className="w-full text-center text-xs text-red-400 hover:text-red-300 py-1 mb-2 transition-colors"
        >
          ⚠ {error} — Click to retry
        </button>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={sending}
          className="flex-1 resize-none px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 overflow-hidden"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={15} className="text-white translate-x-0.5" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-gray-600 mt-1.5 text-right">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
