"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Users, X, Check, Plus } from "lucide-react";

interface GroupChatModalProps {
  onSelectConversation: (id: Id<"conversations">) => void;
  onClose: () => void;
}

export function GroupChatModal({ onSelectConversation, onClose }: GroupChatModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Id<"users">[]>([]);
  const [creating, setCreating] = useState(false);

  const users = useQuery(api.users.getUsers, {});
  const createGroup = useMutation(api.conversations.createGroupConversation);

  const toggleUser = (id: Id<"users">) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return;
    setCreating(true);
    try {
      const convId = await createGroup({
        memberIds: selectedIds,
        groupName: groupName.trim(),
      });
      onSelectConversation(convId);
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">New Group Chat</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3 border-b border-gray-800">
        <input
          autoFocus
          type="text"
          placeholder="Group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {users === undefined ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
            No users available
          </div>
        ) : (
          <ul className="py-1">
            {users.map((user) => {
              const selected = selectedIds.includes(user._id);
              return (
                <li key={user._id}>
                  <button
                    onClick={() => toggleUser(user._id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                          {user.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-sm text-gray-200 truncate">
                      {user.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected
                          ? "bg-indigo-500 border-indigo-500"
                          : "border-gray-600"
                      }`}
                    >
                      {selected && <Check size={11} className="text-white" />}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleCreate}
          disabled={!groupName.trim() || selectedIds.length === 0 || creating}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {creating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={14} />
              Create Group
              {selectedIds.length > 0 && (
                <span className="ml-1 text-indigo-300">
                  ({selectedIds.length + 1} members)
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
