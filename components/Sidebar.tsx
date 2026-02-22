"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { ConversationList } from "./ConversationList";
import { UserSearch } from "./UserSearch";
import { GroupChatModal } from "./GroupChatModal";
import { Edit, LogOut, Users } from "lucide-react";

interface SidebarProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
  currentUser: {
    name: string;
    imageUrl?: string;
    isOnline: boolean;
  } | null;
}

type SidebarView = "conversations" | "search" | "group";

export function Sidebar({
  selectedConversationId,
  onSelectConversation,
  currentUser,
}: SidebarProps) {
  const [view, setView] = useState<SidebarView>("conversations");
  const { signOut } = useClerk();

  const handleSelectConversation = (id: Id<"conversations">) => {
    onSelectConversation(id);
    setView("conversations");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {currentUser?.imageUrl ? (
              <img
                src={currentUser.imageUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                {currentUser?.name[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-gray-900" />
          </div>
          <span className="text-sm font-semibold text-white truncate max-w-[120px]">
            {currentUser?.name ?? "Loading..."}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setView(view === "group" ? "conversations" : "group")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "group"
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-800 text-gray-400 hover:text-white"
            }`}
            title="New group chat"
          >
            <Users size={16} />
          </button>
          <button
            onClick={() => setView(view === "search" ? "conversations" : "search")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "search"
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-800 text-gray-400 hover:text-white"
            }`}
            title="New conversation"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* App title */}
      {view === "conversations" && (
        <div className="px-4 py-2">
          <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Messages
          </h1>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {view === "conversations" && (
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={onSelectConversation}
          />
        )}
        {view === "search" && (
          <UserSearch
            onSelectConversation={handleSelectConversation}
            onClose={() => setView("conversations")}
          />
        )}
        {view === "group" && (
          <GroupChatModal
            onSelectConversation={handleSelectConversation}
            onClose={() => setView("conversations")}
          />
        )}
      </div>
    </div>
  );
}
