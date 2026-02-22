"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function usePresence() {
  const { isSignedIn } = useUser();
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  const heartbeatMutation = useMutation(api.users.heartbeat);

  useEffect(() => {
    if (!isSignedIn) return;

    setOnlineStatus({ isOnline: true });

    const interval = setInterval(() => {
      heartbeatMutation();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setOnlineStatus({ isOnline: true });
      }
    };

    const handleBeforeUnload = () => {
      setOnlineStatus({ isOnline: false });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOnlineStatus({ isOnline: false });
    };
  }, [isSignedIn, setOnlineStatus, heartbeatMutation]);
}
