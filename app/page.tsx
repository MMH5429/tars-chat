"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePresence } from "@/hooks/usePresence";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { Id } from "@/convex/_generated/dataModel";

export default function HomePage() {
  const { currentUser } = useCurrentUser();
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");

  usePresence();

  const handleSelectConversation = (id: Id<"conversations">) => {
    setSelectedConversationId(id);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("sidebar");
  };

  return (
    <div className="h-dvh flex overflow-hidden bg-gray-950">
      {/* Desktop: side-by-side. Mobile: one view at a time */}

      {/* Sidebar */}
      <div
        className={`
          w-full lg:w-80 xl:w-96 flex-shrink-0
          ${mobileView === "sidebar" ? "flex" : "hidden"} lg:flex
          flex-col
        `}
      >
        <Sidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          currentUser={currentUser ?? null}
        />
      </div>

      {/* Chat area */}
      <div
        className={`
          flex-1 min-w-0
          ${mobileView === "chat" ? "flex" : "hidden"} lg:flex
          flex-col
        `}
      >
        <ChatArea
          conversationId={selectedConversationId}
          currentUserId={currentUser?._id ?? null}
          onBack={handleBack}
          showBackButton={mobileView === "chat"}
        />
      </div>
    </div>
  );
}
