"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ArrowLeft, Users, MessageSquare } from "lucide-react";

interface ChatAreaProps {
  conversationId: Id<"conversations"> | null;
  currentUserId: Id<"users"> | null;
  onBack: () => void;
  showBackButton: boolean;
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-600 px-8">
      <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
        <MessageSquare size={32} className="text-gray-600" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-400">TARS Chat</h2>
        <p className="text-sm mt-1 text-gray-600">
          Select a conversation or start a new one
        </p>
      </div>
    </div>
  );
}

function ActiveChat({
  conversationId,
  currentUserId,
  onBack,
  showBackButton,
}: {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  onBack: () => void;
  showBackButton: boolean;
}) {
  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const otherUser = conversation.otherUsers[0];
  const displayName = conversation.isGroup
    ? conversation.groupName
    : otherUser?.name ?? "Unknown";
  const avatar = conversation.isGroup ? null : otherUser?.imageUrl;
  const isOnline = !conversation.isGroup && (otherUser?.isOnline ?? false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="relative flex-shrink-0">
          {conversation.isGroup ? (
            <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
          ) : avatar ? (
            <img
              src={avatar}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              {displayName?.[0]?.toUpperCase()}
            </div>
          )}
          {!conversation.isGroup && (
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${
                isOnline ? "bg-green-500" : "bg-gray-600"
              }`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">
            {displayName}
            {conversation.isGroup && (
              <span className="ml-1.5 text-xs text-gray-500 font-normal">
                {conversation.otherUsers.length + 1} members
              </span>
            )}
          </h2>
          <p className={`text-xs ${isOnline ? "text-green-500" : "text-gray-500"}`}>
            {conversation.isGroup ? "" : isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        conversationId={conversationId}
        currentUserId={currentUserId}
        isGroup={conversation.isGroup}
      />

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </>
  );
}

export function ChatArea({
  conversationId,
  currentUserId,
  onBack,
  showBackButton,
}: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full bg-gray-950">
      {conversationId && currentUserId ? (
        <ActiveChat
          conversationId={conversationId}
          currentUserId={currentUserId}
          onBack={onBack}
          showBackButton={showBackButton}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
