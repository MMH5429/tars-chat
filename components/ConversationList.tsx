"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatConversationTime } from "@/lib/formatDate";
import { MessageSquare, Users } from "lucide-react";

interface ConversationListProps {
  selectedId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const conversations = useQuery(api.conversations.listConversations);

  if (conversations === undefined) {
    return (
      <div className="flex-1 space-y-1 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-800 rounded w-2/3" />
              <div className="h-2 bg-gray-800 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500 px-6">
        <MessageSquare size={40} className="opacity-30" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400">No conversations yet</p>
          <p className="text-xs mt-1">Search for a user above to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {conversations.map((conv) => {
        if (!conv) return null;
        const isSelected = conv._id === selectedId;
        const otherUser = conv.otherUsers[0];
        const displayName = conv.isGroup
          ? conv.groupName
          : otherUser?.name ?? "Unknown";
        const avatar = conv.isGroup ? null : otherUser?.imageUrl;
        const isOnline = !conv.isGroup && otherUser?.isOnline;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mx-1 transition-colors text-left ${
              isSelected
                ? "bg-indigo-600/20 border border-indigo-600/30"
                : "hover:bg-gray-800/60"
            }`}
          >
            <div className="relative flex-shrink-0">
              {conv.isGroup ? (
                <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
              ) : avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  {displayName?.[0]?.toUpperCase()}
                </div>
              )}
              {!conv.isGroup && (
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${
                    isOnline ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm font-medium truncate ${
                    isSelected ? "text-white" : "text-gray-200"
                  }`}
                >
                  {displayName}
                  {conv.isGroup && (
                    <span className="ml-1.5 text-xs text-gray-500">
                      {conv.otherUsers.length + 1}
                    </span>
                  )}
                </p>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatConversationTime(conv.lastMessageTime)}
                </span>
              </div>

              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={`text-xs truncate ${
                    conv.unreadCount > 0
                      ? "text-gray-300 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {conv.lastMessagePreview ?? "No messages yet"}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="flex-shrink-0 ml-2 min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
