"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, X, Users } from "lucide-react";

interface UserSearchProps {
  onSelectConversation: (id: Id<"conversations">) => void;
  onClose: () => void;
}

export function UserSearch({ onSelectConversation, onClose }: UserSearchProps) {
  const [search, setSearch] = useState("");
  const users = useQuery(api.users.getUsers, { search: search || undefined });
  const getOrCreate = useMutation(api.conversations.getOrCreateConversation);

  const handleSelect = async (userId: Id<"users">) => {
    const convId = await getOrCreate({ otherUserId: userId });
    onSelectConversation(convId);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">New Conversation</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            autoFocus
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {users === undefined ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Users size={32} className="mb-2 opacity-50" />
            <p className="text-sm">
              {search ? "No users found" : "No other users yet"}
            </p>
          </div>
        ) : (
          <ul className="py-1">
            {users.map((user) => (
              <li key={user._id}>
                <button
                  onClick={() => handleSelect(user._id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${
                        user.isOnline ? "bg-green-500" : "bg-gray-600"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.isOnline ? "Online" : user.email}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
