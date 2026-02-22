"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });

  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u!.name);
  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
      <div className="flex gap-0.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
      </div>
      <span>{label}...</span>
    </div>
  );
}
