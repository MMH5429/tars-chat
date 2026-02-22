# TARS Chat

A real-time messaging web app built with Next.js, TypeScript, Convex, and Clerk.

## Features

- **Authentication** – Sign up/in via Clerk (email, Google, GitHub, etc.)
- **User Discovery** – See all users, search by name
- **1:1 DMs** – Real-time private conversations via Convex subscriptions
- **Group Chat** – Create group conversations with multiple members
- **Timestamps** – Smart formatting (time only / date+time / with year)
- **Empty States** – Helpful messages everywhere
- **Responsive** – Mobile-first, sidebar+chat on desktop
- **Online/Offline Status** – Real-time green dot indicator
- **Typing Indicator** – Animated dots while someone types
- **Unread Counts** – Badge per conversation, cleared on open
- **Smart Auto-Scroll** – Auto-scrolls to latest, "↓ New messages" button when scrolled up
- **Delete Messages** – Soft-delete with "This message was deleted"
- **Reactions** – 👍 ❤️ 😂 😮 😢 with toggle + counts
- **Loading States** – Skeleton loaders and spinners

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Convex** (backend, database, real-time)
- **Clerk** (authentication)
- **Tailwind CSS v4**

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create an app
2. Enable Email/Password and social logins
3. Go to **JWT Templates** → Create a **Convex** template
4. Copy the **Issuer** URL (e.g. `https://xxx.clerk.accounts.dev`)
5. Copy your Publishable Key and Secret Key

### 3. Set up Convex

```bash
npx convex dev
```

This prompts you to log in, creates a project, sets `NEXT_PUBLIC_CONVEX_URL` in `.env.local`, deploys your schema and functions, and starts the dev server.

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in all values.

### 5. Run the app

Terminal 1:
```bash
npx convex dev
```

Terminal 2:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

1. Push to GitHub
2. Run `npx convex deploy` to deploy the backend
3. Import the repo on [vercel.com](https://vercel.com) and add all env vars

## Project Structure

```
tars-chat/
├── app/
│   ├── (auth)/          # Clerk sign-in/sign-up pages
│   ├── layout.tsx       # Root layout with Clerk + Convex providers
│   └── page.tsx         # Main chat page
├── components/
│   ├── providers/       # ConvexClientProvider
│   ├── Sidebar.tsx      # Left sidebar
│   ├── ConversationList.tsx
│   ├── ChatArea.tsx     # Right chat panel
│   ├── MessageList.tsx  # Scrollable messages with auto-scroll
│   ├── MessageItem.tsx  # Message bubble + reactions + delete
│   ├── MessageInput.tsx # Textarea with typing indicator
│   ├── UserSearch.tsx   # Find users to message
│   ├── GroupChatModal.tsx
│   └── TypingIndicator.tsx
├── convex/
│   ├── schema.ts        # Database schema
│   ├── auth.config.ts   # Clerk JWT config
│   ├── users.ts
│   ├── conversations.ts
│   ├── messages.ts
│   └── typing.ts
├── hooks/
│   ├── useCurrentUser.ts  # Sync Clerk user to Convex
│   ├── usePresence.ts     # Online/offline heartbeat
│   └── useTyping.ts       # Debounced typing events
└── lib/
    ├── utils.ts           # cn() helper
    └── formatDate.ts      # Smart timestamp formatting
```
