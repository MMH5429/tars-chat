"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    syncUser({
      clerkId: user.id,
      name: user.fullName ?? user.username ?? "Anonymous",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      imageUrl: user.imageUrl,
    });
  }, [user, isLoaded, syncUser]);

  return { currentUser, isLoaded };
}
