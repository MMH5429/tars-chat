"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/formatDate";
import { Trash2, SmilePlus } from "lucide-react";

const EMOJI_SET = ["👍", "❤️", "😂", "😮", "😢"];

interface Reaction {
  userId: Id<"users">;
  emoji: string;
}

interface MessageItemProps {
  message: {
    _id: Id<"messages">;
    content: string;
    isDeleted: boolean;
    isOwn: boolean;
    _creationTime: number;
    reactions?: Reaction[];
    sender?: {
      _id: Id<"users">;
      name: string;
      imageUrl?: string;
    } | null;
  };
  showSender: boolean;
  currentUserId: Id<"users">;
  isGroup: boolean;
}

export function MessageItem({
  message,
  showSender,
  currentUserId,
  isGroup,
}: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const addReaction = useMutation(api.messages.addReaction);

  const handleDelete = async () => {
    await deleteMessage({ messageId: message._id });
  };

  const handleReaction = async (emoji: string) => {
    await addReaction({ messageId: message._id, emoji });
    setShowReactionPicker(false);
  };

  // Group reactions by emoji with counts
  const reactionMap = new Map<string, { count: number; hasOwn: boolean }>();
  for (const r of message.reactions ?? []) {
    const existing = reactionMap.get(r.emoji) ?? { count: 0, hasOwn: false };
    reactionMap.set(r.emoji, {
      count: existing.count + 1,
      hasOwn: existing.hasOwn || r.userId === currentUserId,
    });
  }

  return (
    <div
      className={`flex gap-2 group px-4 py-0.5 ${
        message.isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-7">
        {showSender && !message.isOwn && (
          <>
            {message.sender?.imageUrl ? (
              <img
                src={message.sender.imageUrl}
                alt={message.sender.name}
                className="w-7 h-7 rounded-full object-cover mt-1"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold mt-1">
                {message.sender?.name[0]?.toUpperCase()}
              </div>
            )}
          </>
        )}
      </div>

      <div
        className={`flex flex-col max-w-[70%] ${
          message.isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name for groups */}
        {showSender && !message.isOwn && isGroup && message.sender && (
          <span className="text-xs text-indigo-400 mb-1 px-1">
            {message.sender.name}
          </span>
        )}

        <div className="relative">
          {/* Message bubble */}
          {message.isDeleted ? (
            <div
              className={`px-3 py-2 rounded-2xl text-sm italic text-gray-500 border ${
                message.isOwn
                  ? "bg-gray-800 border-gray-700 rounded-tr-sm"
                  : "bg-gray-800 border-gray-700 rounded-tl-sm"
              }`}
            >
              This message was deleted
            </div>
          ) : (
            <div
              className={`px-3 py-2 rounded-2xl text-sm ${
                message.isOwn
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-gray-800 text-gray-100 rounded-tl-sm"
              }`}
            >
              {message.content}
            </div>
          )}

          {/* Action buttons (hover) */}
          {!message.isDeleted && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                message.isOwn ? "right-full mr-2" : "left-full ml-2"
              }`}
            >
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="React"
              >
                <SmilePlus size={13} />
              </button>
              {message.isOwn && (
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}

          {/* Reaction picker */}
          {showReactionPicker && (
            <div
              className={`absolute z-10 bottom-full mb-1 flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1.5 shadow-xl ${
                message.isOwn ? "right-0" : "left-0"
              }`}
            >
              {EMOJI_SET.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions */}
        {reactionMap.size > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Array.from(reactionMap.entries()).map(([emoji, { count, hasOwn }]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                  hasOwn
                    ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-600 mt-0.5 px-1">
          {formatMessageTime(message._creationTime)}
        </span>
      </div>
    </div>
  );
}
