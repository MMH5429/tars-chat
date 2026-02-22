"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { ArrowDown, MessageSquareDashed } from "lucide-react";

interface MessageListProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  isGroup: boolean;
}

export function MessageList({
  conversationId,
  currentUserId,
  isGroup,
}: MessageListProps) {
  const messages = useQuery(api.messages.listMessages, { conversationId });
  const markRead = useMutation(api.conversations.markConversationRead);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevLengthRef = useRef(0);

  // Mark read when opening conversation
  useEffect(() => {
    markRead({ conversationId });
  }, [conversationId, markRead]);

  // Detect scroll position
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewMessages(false);
  };

  // Auto-scroll logic: scroll to bottom on new messages only if already at bottom
  useEffect(() => {
    if (!messages) return;
    const newLength = messages.length;
    if (newLength > prevLengthRef.current) {
      const lastMsg = messages[newLength - 1];
      const isOwnMessage = lastMsg?.isOwn;

      if (isAtBottom || isOwnMessage) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setHasNewMessages(false);
      } else {
        setHasNewMessages(true);
      }
    }
    prevLengthRef.current = newLength;
  }, [messages, isAtBottom]);

  // Initial scroll to bottom + reset state on conversation change
  useEffect(() => {
    setIsAtBottom(true);
    setHasNewMessages(false);
    bottomRef.current?.scrollIntoView();
    prevLengthRef.current = messages?.length ?? 0;
  }, [conversationId]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasNewMessages(false);
    setIsAtBottom(true);
  };

  if (messages === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500 px-6">
        <MessageSquareDashed size={40} className="opacity-30" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400">No messages yet</p>
          <p className="text-xs mt-1">Be the first to say something!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative min-h-0 flex flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-3"
      >
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showSender =
            !prev ||
            prev.senderId !== msg.senderId ||
            msg._creationTime - prev._creationTime > 5 * 60 * 1000;

          return (
            <MessageItem
              key={msg._id}
              message={msg}
              showSender={showSender}
              currentUserId={currentUserId}
              isGroup={isGroup}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator conversationId={conversationId} />

      {hasNewMessages && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-full shadow-lg transition-colors z-10"
        >
          <ArrowDown size={12} />
          New messages
        </button>
      )}
    </div>
  );
}
