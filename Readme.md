# Chat Application

A comprehensive and professional real-time chat application built with modern web technologies. This application provides secure and instant communication with features like group messaging, direct messaging, real-time typing indicators, and message replies.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)

## Features

- **Real-time Communication:** Instant messaging powered by WebSocket technology (Socket.IO).
- **Authentication:** Secure user registration, login, and session management using JWT (JSON Web Tokens).
- **Direct Messaging (DM):** One-on-one private chat functionality.
- **Group Chats:** Create groups, add/remove members, and chat within a group setting.
- **Typing Indicators:** Real-time visibility when other users are typing a message.
- **Message Replies:** Ability to reply to specific messages within a conversation, similar to modern messaging platforms.
- **Read Receipts:** Track and display the read status of messages (Sent, Delivered, Read).
- **User Presence:** See when other users are online or offline.
- **Media Support:** Upload and share images and files (Cloudinary integration).
- **Video Calling:** Integrated video call capabilities for instant meetings.
- **Responsive Design:** A fully responsive interface that works seamlessly across desktop and mobile devices.

## Architecture

The application is structured as a full-stack monorepo style (or separate client/server folders), divided into two main parts:

1.  **Frontend (Client):** A Next.js application handling the user interface, state management, and real-time socket connections.
2.  **Backend (Server):** A Node.js/Express.js server handling API requests, database interactions, JWT authentication, and managing the Socket.IO server for real-time events.

### Directory Structure

```text
Chating/
├── client/                     # Frontend Application (Next.js/React)
│   ├── api/                    # API client utilities (Axios configurations)
│   ├── app/                    # Next.js App Router (Pages, Layouts)
│   │   ├── signin/             # Sign-in page
│   │   ├── signup/             # Sign-up page
│   │   ├── chat/               # Main chat interface
│   │   └── video/              # Video calling interface
│   ├── components/             # Reusable UI components
│   ├── context/                # React Contexts (AuthContext, SocketContext)
│   ├── hooks/                  # Custom React hooks (e.g., useDebounce)
│   ├── lib/                    # General utility functions and helpers
│   └── public/                 # Static assets
└── server/                     # Backend Application (Node.js/Express)
    ├── src/
    │   ├── controllers/        # Request handlers (auth, message, group, video)
    │   ├── middlewares/        # Express middlewares (auth parsing, error handling)
    │   ├── models/             # Mongoose schemas and models (User, Message, Group)
    │   ├── routes/             # Express API route definitions
    │   ├── socket/             # Socket.IO configuration and event handlers
    │   └── utils/              # Helper functions (token generation, standard responses)
    ├── .env.example            # Example environment variables file
    ├── index.ts                # Application entry point
    └── package.json            # Backend dependencies and scripts
```

## Tech Stack

### Frontend

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Real-time Engine:** Socket.IO Client
- **HTTP Client:** Axios
- **UI Components:** Shadcn UI (or Lucide Icons)

### Backend

- **Runtime:** Bun
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Real-time Engine:** Socket.IO
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **File Storage:** Cloudinary (for media uploads)

## Prerequisites

Before running the application locally, ensure you have the following installed:

- Bun package manager
- MongoDB (Local instance or MongoDB Atlas cluster)
- Cloudinary Account (for image handling)
- Redis (Local instance or Redis Atlas cluster)

## Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Chating
   ```

2. **Install Backend Dependencies:**

   ```bash
   cd server
   bun install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

## Environment Variables

### Backend Configuration

Navigate to the `server` directory and create a `.env` file based on the `.env.example` provided:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Configuration

Navigate to the `client` directory and create a `.env.local` file:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Running the Application

To run the application in a development environment, you will need to start both the frontend and backend servers.

1. **Start the Backend Server:**

   ```bash
   cd server
   bun run dev
   ```

   The backend will typically start on `http://localhost:3001`.

2. **Start the Frontend Application:**
   Open a new terminal window.
   ```bash
   cd client
   npm run dev
   ```
   The frontend will typically start on `http://localhost:3000`.

## API Endpoints

The backend API follows RESTful principles. Here is a brief overview of the core endpoints:

**Authentication Routes (`/api/v1/users`)**

- `POST /register`: Register a new user
- `POST /login`: Authenticate user and issue tokens
- `POST /logout`: Clear user session
- `GET /me`: Get current authenticated user details
- `PATCH /update-profile`: Update user avatar or display name

**Chat & Message Routes (`/api/v1/messages` & `/api/v1/chats`)**

- `GET /:chatId`: Retrieve message history for a specific chat
- `POST /send/:chatId`: Send a new text/media message
- `GET /contacts`: Retrieve user's contact list
- `POST /read-receipt`: Update message read status

**Group Routes (`/api/v1/groups`)**

- `POST /create`: Create a new group chat
- `PATCH /:groupId/add`: Add member to group
- `PATCH /:groupId/remove`: Remove member from group
- `PATCH /:groupId/rename`: Change group name

**Video Call Routes (`/api/v1/video`)**

- `POST /create`: Initialize a new video call session
- `POST /join`: Join an existing video call
- `POST /end`: Terminate a video call session

---

Read my article on the End-to-End Encryption: https://medium.com/@shivamraj1109.23/understanding-end-to-end-encryption-build-a-secure-chat-app-with-next-js-websocket-and-web-crypto-ad66679d887c

_For more detailed information regarding socket events, context payloads, and component specifics, please refer to the inline documentation within the source code files._
