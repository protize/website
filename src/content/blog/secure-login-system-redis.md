---
title: "Secure Login System with Temporary Account Lock Using Redis"
description: "Stop brute-force attacks with a scalable login throttle using Redis counters and TTL-based account locks."
pubDate: 2025-10-16
author: "Protize Engineering"
tags: ["security", "redis", "authentication", "nodejs"]
category: "Security"
coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1600&auto=format&fit=crop"
coverAlt: "Abstract padlock and circuitry representing secure authentication"
draft: false
---

In modern web applications, securing user accounts against unauthorized access is critical. One of the most common attack vectors is **brute-force login attempts**, where an attacker repeatedly tries different passwords until one succeeds.  

A robust, low-latency solution to mitigate this risk is to **limit login attempts and temporarily lock accounts** after multiple failed tries.  

This post explains how to design a clean, scalable implementation using **Redis** for counters and **TTL-based locks**.  
<br>

---

## 🔒 Why Limit Login Attempts?

Allowing unlimited login attempts exposes users to several risks:  

- **Brute-force attacks:** Automated bots try thousands of password combinations.  
- **Credential stuffing:** Attackers reuse leaked passwords from other sites.  
- **Account compromise:** Weak or predictable passwords make accounts easier to breach.  

By setting limits and temporary blocks, you can:  

- Reduce the chance of unauthorized access.  
- Alert users of suspicious behavior.  
- Give the system time to throttle repeated attempts.  
<br>

---

## 🧠 The Core Concept

We’ll follow three simple principles:

1. **Track login attempts** – Every failed login increments a counter per user.  
2. **Temporary block** – When failures exceed a threshold (e.g., 3), block the account for a defined time (e.g., 15 minutes).  
3. **Reset on success** – Successful logins clear counters and unlock the user.  

**Why Redis?**

- ⚡ **Blazing fast** (millions of ops/sec)  
- ⏱ **TTL support** for auto-expiring counters and blocks  
- 🧩 **Centralized** and scalable for distributed apps  
<br>

![Close-up of server racks with purple lighting](https://images.unsplash.com/photo-1614064642261-3ccbfafa481b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170)
<br>

---

## ⚙️ How It Works (Step-by-Step)

### 1️⃣ Track Failed Attempts

Each failed login increments a Redis counter:  
`login:fail:<userId>` → integer  

Set a **15-minute TTL** so old failures auto-expire.  

```text
INCR login:fail:<userId>
EXPIRE login:fail:<userId> 900   # 15 minutes
```
<br>

### 2️⃣ Block After Threshold

If the counter exceeds the limit (e.g., 3), add a temporary block key:  
`login:block:<userId>` → `"1"` with 15-minute TTL  

This prevents further login attempts until the lock expires.  

```text
SET login:block:<userId> 1 EX 900 NX
```
<br>

### 3️⃣ Reset After Success

On successful login, clear both Redis keys:  

```text
DEL login:fail:<userId> login:block:<userId>
```
<br>

---

## 💻 Example Implementation (Node.js + Redis)

Here’s a practical snippet using **Express** and **ioredis**:  

```ts
// src/auth/login.ts
import type { Request, Response } from "express";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

const FAIL_KEY = (userId: string) => `login:fail:${userId}`;
const BLOCK_KEY = (userId: string) => `login:block:${userId}`;

const FAIL_TTL_SECONDS = 15 * 60;
const BLOCK_TTL_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 3;

export async function loginHandler(req: Request, res: Response) {
  const { identifier, password } = req.body;

  const user = await findUser(identifier);
  const userId = user?.id ?? `ghost:${identifier}`;

  const isBlocked = await redis.exists(BLOCK_KEY(userId));
  if (isBlocked) {
    return res.status(429).json({ message: "Invalid credentials." });
  }

  const isValid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!isValid) {
    const fails = await redis.incr(FAIL_KEY(userId));
    await redis.expire(FAIL_KEY(userId), FAIL_TTL_SECONDS);
    if (fails >= MAX_ATTEMPTS) {
      await redis.set(BLOCK_KEY(userId), "1", "EX", BLOCK_TTL_SECONDS);
    }
    return res.status(401).json({ message: "Invalid credentials." });
  }

  await redis.del(FAIL_KEY(userId), BLOCK_KEY(userId));
  const token = await createSession(user.id);
  return res.json({ token });
}

async function findUser(identifier: string) { return null as any; }
async function verifyPassword(plain: string, hash: string) { return false; }
async function createSession(userId: string) { return "token"; }
```
<br>

---

## 🔐 Security Best Practices

- **Use Generic Error Messages** → Always respond with neutral messages (“Invalid credentials”)  
- **Hash Passwords Properly** → Use **bcrypt** or **Argon2**  
- **Add IP-Based Rate Limiting** → Prevent distributed brute-force attacks  
- **Implement Exponential Backoff** → Increase block time with repeated failures  
- **User Alerts** → Email or push notification when an account is locked  
- **Comprehensive Logging** → Track login anomalies for forensics  
<br>

![Minimal padlock with purple light and keyboard](https://images.unsplash.com/photo-1654588836793-c6babf14d254?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170)
<br>

---

## ⚡ Benefits of Using Redis

Redis makes implementing secure throttling effortless:

- 🚀 **Atomic counters** ensure precise increments  
- 🕒 **TTL expiration** cleans up stale attempts  
- 🧠 **Centralized** data layer supports horizontal scaling  
- 🔁 **Session storage** can also be handled in the same system  
<br>

---

## 🧭 Final Thoughts

With minimal overhead, you can build a **resilient defense layer** against brute-force and credential-stuffing attacks.  

When combined with **strong passwords**, **2FA**, and **IP-based throttling**, this approach provides both security and speed without hurting user experience.  

**Stay Secure. Build Smart.**  
**— Protize Engineering**
