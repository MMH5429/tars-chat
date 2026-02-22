import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreateConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Find existing 1:1 conversation
    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();

    for (const membership of myMemberships) {
      const conv = await ctx.db.get(membership.conversationId);
      if (!conv || conv.isGroup) continue;

      const otherMembership = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation_user", (q) =>
          q
            .eq("conversationId", conv._id)
            .eq("userId", args.otherUserId)
        )
        .first();

      if (otherMembership) return conv._id;
    }

    // Create new conversation
    const convId = await ctx.db.insert("conversations", {
      participantIds: [currentUser._id, args.otherUserId],
      isGroup: false,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId: convId,
      userId: currentUser._id,
      lastReadTime: Date.now(),
    });

    await ctx.db.insert("conversationMembers", {
      conversationId: convId,
      userId: args.otherUserId,
      lastReadTime: 0,
    });

    return convId;
  },
});

export const listConversations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();

    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conv = await ctx.db.get(membership.conversationId);
        if (!conv) return null;

        const allMembers = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conv._id)
          )
          .collect();

        const otherUsers = await Promise.all(
          allMembers
            .filter((m) => m.userId !== currentUser._id)
            .map((m) => ctx.db.get(m.userId))
        );

        const allMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conv._id)
          )
          .collect();

        const unreadCount = allMessages.filter(
          (msg) =>
            msg._creationTime > membership.lastReadTime &&
            msg.senderId !== currentUser._id &&
            !msg.isDeleted
        ).length;

        return {
          ...conv,
          otherUsers: otherUsers.filter(Boolean),
          unreadCount,
          lastReadTime: membership.lastReadTime,
        };
      })
    );

    return conversations
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b!.lastMessageTime ?? b!._creationTime) -
          (a!.lastMessageTime ?? a!._creationTime)
      );
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return null;

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", currentUser._id)
      )
      .first();

    if (!membership) return null;

    const allMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const otherUsers = await Promise.all(
      allMembers
        .filter((m) => m.userId !== currentUser._id)
        .map((m) => ctx.db.get(m.userId))
    );

    return { ...conv, otherUsers: otherUsers.filter(Boolean) };
  },
});

export const markConversationRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return;

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", currentUser._id)
      )
      .first();

    if (membership) {
      await ctx.db.patch(membership._id, { lastReadTime: Date.now() });
    }
  },
});

export const createGroupConversation = mutation({
  args: {
    memberIds: v.array(v.id("users")),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    const allParticipantIds = [currentUser._id, ...args.memberIds];

    const convId = await ctx.db.insert("conversations", {
      participantIds: allParticipantIds,
      isGroup: true,
      groupName: args.groupName,
    });

    for (const userId of allParticipantIds) {
      await ctx.db.insert("conversationMembers", {
        conversationId: convId,
        userId,
        lastReadTime: Date.now(),
      });
    }

    return convId;
  },
});
