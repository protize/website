---
title: "Building a Real-Time Notification System with WebSockets and NestJS"
description: "Step-by-step guide to building a live notification system using NestJS WebSocket Gateways, Socket.IO, and React — with targeted user delivery and reconnection handling."
pubDate: 2026-05-10
author: "Protize Team"
tags: ["nestjs", "websockets", "real-time", "notifications", "socket.io", "react"]
category: "Backend"
coverImage: "https://images.unsplash.com/photo-1685381949388-bb0402fbe133?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
coverAlt: "Glowing network nodes representing real-time communication"
---

Users today expect real-time experiences. When someone comments on your post, you shouldn't have to refresh the page to see it — a notification badge should appear immediately. When a colleague mentions you in a document, you should know instantly. This is the standard set by modern applications like Slack, GitHub, and Notion.

The technology that makes this possible is **WebSockets**. In this blog, we'll build a complete, production-ready notification system using **NestJS** with **Socket.IO** on the backend and **React** on the frontend — with proper authentication, targeted delivery, and reconnection handling.

---

## WebSockets vs. HTTP Polling

Before diving in, let's understand why WebSockets are the right tool for real-time features.

**HTTP Polling (the bad approach):**
```
Client: "Any new notifications?" → Server: "No."    (every 5 seconds)
Client: "Any new notifications?" → Server: "No."
Client: "Any new notifications?" → Server: "Yes! Here's one."
```

Problems: N requests per user × polling interval = massive unnecessary load. A 1,000-user app polling every 5 seconds generates 200 requests/second, all returning empty responses.

**WebSockets (the right approach):**
```
Client → Server: [Upgrade to WebSocket]
Server → Client: [Persistent connection established]
... (silence until something happens) ...
Server → Client: "New notification: Alice commented on your post"
```

The connection stays open, the server pushes data only when there's something to push, and the overhead is minimal.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  useNotifications() hook → Socket.IO client      │
└──────────────┬──────────────────────────────────┘
               │ WebSocket (ws://)
┌──────────────▼──────────────────────────────────┐
│              NestJS WebSocket Gateway            │
│  NotificationsGateway                            │
│  - handleConnection() → stores userId ↔ socketId│
│  - sendNotificationToUser(userId, data)          │
└──────────────┬──────────────────────────────────┘
               │ Called by
┌──────────────▼──────────────────────────────────┐
│              NestJS Services                     │
│  PostsService, CommentsService, etc.             │
│  → trigger notifications on business events     │
└─────────────────────────────────────────────────┘
```

---

## Backend Setup

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install -D @types/socket.io
```

### The Notifications Gateway

```typescript
// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface NotificationPayload {
  id: string;
  type: 'NEW_COMMENT' | 'NEW_FOLLOWER' | 'POST_LIKED' | 'MENTION' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  avatar?: string;
  createdAt: string;
  read: boolean;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // Maps userId → Set of socket IDs (user can have multiple browser tabs)
  private readonly userSockets = new Map<number, Set<string>>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract and verify JWT from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const userId: number = payload.sub;

      // Store the socket association
      client.data.userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join a room named after the user
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} connected (socket: ${client.id})`);

      // Send any unread notifications on connection
      client.emit('connected', {
        message: 'Connected to notification service',
        userId,
      });

    } catch (error) {
      this.logger.warn(`Connection rejected: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);
    }
  }

  // Send notification to a specific user (all their active sessions)
  sendToUser(userId: number, notification: NotificationPayload): boolean {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      // Emit to the user's room — all their browser tabs receive it
      this.server.to(`user:${userId}`).emit('notification', notification);
      this.logger.log(`Sent notification to user ${userId}: ${notification.type}`);
      return true;
    }
    return false; // User not online — notification should be stored in DB
  }

  // Broadcast to all connected users
  broadcastToAll(notification: NotificationPayload) {
    this.server.emit('global_notification', notification);
    this.logger.log(`Broadcast notification: ${notification.type}`);
  }

  // Client acknowledges reading a notification
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    this.logger.log(
      `User ${client.data.userId} marked notification ${data.notificationId} as read`,
    );
    // Return acknowledgment to the client
    return { success: true, notificationId: data.notificationId };
  }

  // Client requests their unread count
  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    // In production, fetch from database
    return { unreadCount: 0 };
  }

  getOnlineUsers(): number[] {
    return Array.from(this.userSockets.keys());
  }

  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }
}
```

### Notification Database Schema

```sql
CREATE TABLE notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  link        VARCHAR(500),
  avatar_url  VARCHAR(500),
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW(),
  read_at     TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread
ON notifications(user_id, read, created_at DESC)
WHERE read = false;
```

### Notifications Service

```typescript
// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway, NotificationPayload } from './notifications.gateway';
import { v4 as uuid } from 'uuid';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async create(userId: number, data: Omit<NotificationPayload, 'id' | 'createdAt' | 'read'>) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        avatarUrl: data.avatar,
      },
    });

    const payload: NotificationPayload = {
      id: notification.id,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      link: notification.link || undefined,
      avatar: notification.avatarUrl || undefined,
      createdAt: notification.createdAt.toISOString(),
      read: false,
    };

    // Try to deliver in real-time — if user is online, they get it immediately
    const delivered = this.gateway.sendToUser(userId, payload);

    if (!delivered) {
      // User is offline — notification is saved in DB, they'll see it on next login
      console.log(`User ${userId} is offline — notification saved for later`);
    }

    return notification;
  }

  async getUserNotifications(userId: number, limit = 20, offset = 0) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return { notifications, unreadCount };
  }

  async markAsRead(notificationId: string, userId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }
}
```

### Triggering Notifications from Business Logic

```typescript
// src/comments/comments.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(postId: number, authorId: number, content: string) {
    const comment = await this.prisma.comment.create({
      data: { postId, authorId, content },
      include: {
        post: { include: { author: true } },
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify the post author — but not if they commented on their own post
    const postAuthorId = comment.post.authorId;
    if (postAuthorId !== authorId) {
      await this.notificationsService.create(postAuthorId, {
        type: 'NEW_COMMENT',
        title: 'New Comment',
        message: `${comment.author.name} commented on "${comment.post.title}"`,
        link: `/posts/${postId}#comment-${comment.id}`,
        avatar: comment.author.avatar,
      });
    }

    return comment;
  }
}
```

---

## React Frontend — Connecting to WebSockets

```bash
npm install socket.io-client
```

### The useNotifications Hook

```tsx
// hooks/useNotifications.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  avatar?: string;
  createdAt: string;
  read: boolean;
}

export function useNotifications() {
  const { user, accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !accessToken) return;

    // Create socket connection
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to notification service');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('notification', (notification: Notification) => {
      // Add to state
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      toast.custom(() => (
        <div className="flex items-center gap-3 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
          {notification.avatar && (
            <img src={notification.avatar} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <p className="font-medium text-sm">{notification.title}</p>
            <p className="text-gray-500 text-xs">{notification.message}</p>
          </div>
        </div>
      ), { duration: 5000 });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, accessToken]);

  const markAsRead = useCallback((notificationId: string) => {
    socketRef.current?.emit('mark_read', { notificationId });
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
}
```

### Notification Bell Component

```tsx
// components/NotificationBell.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white
            text-xs font-bold rounded-full min-w-[18px] h-[18px]
            flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full
          ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl
          border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                    setIsOpen(false);
                  }}
                  className={`flex gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors
                    ${!notification.read ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                >
                  {notification.avatar ? (
                    <img src={notification.avatar}
                      className="w-10 h-10 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex
                      items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t text-center">
            <a href="/notifications" className="text-sm text-blue-600 hover:underline">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Scaling WebSockets with Redis Adapter

When you run multiple instances of your NestJS app (horizontal scaling), WebSocket connections are distributed across instances. User A might be connected to Instance 1, but User B's notification trigger happens on Instance 2 — they'll never receive it.

The solution is the **Redis Adapter** — it uses Redis pub/sub to broadcast events across all instances:

```bash
npm install @socket.io/redis-adapter redis
```

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Create Redis clients for pub/sub
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  // Configure Socket.IO with Redis adapter
  const ioAdapter = new IoAdapter(app);
  ioAdapter.createIOServer = (port, options) => {
    const server = require('socket.io').Server(port, options);
    server.adapter(createAdapter(pubClient, subClient));
    return server;
  };

  app.useWebSocketAdapter(ioAdapter);

  await app.listen(3001);
}
bootstrap();
```

Now all your NestJS instances share the same WebSocket session state through Redis — messages sent on any instance are delivered to users connected to any other instance.

---

## Conclusion

Real-time notifications transform your application from a passive tool into an engaging, responsive experience. By using NestJS WebSocket Gateways with Socket.IO, authenticating connections via JWT, targeting notifications to specific users, and storing notifications in PostgreSQL for offline users — you build a notification system that is both technically solid and genuinely delightful to use.

As you scale, add the Redis adapter and you're ready for multi-instance deployments without any changes to your application logic.
