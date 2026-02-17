---
title: "Avoiding Duplicate Operations: How We Solved a Race Condition in Our Payment System"
description: "How we used optimistic locking to prevent duplicate operations and maintain data accuracy under high concurrency."
pubDate: "2026-02-10"
author: "Protize Team"
tags: ["engineering", "concurrency", "optimistic-locking", "distributed-systems", "backend"]
category: "Engineering"
coverImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
coverAlt: "Abstract digital transaction visualization with glowing network nodes"
draft: false
featured: true
---

When two processes — the **webhook response** and the **status-check job** — handled failed tasks simultaneously, our users sometimes had their account credits restored **twice**. This post explains how our job processing system encountered a concurrency issue and how we fixed it using **optimistic locking**.

---

## 💥 The Problem

At first glance, our task processing flow looked simple:

1. A user submits a task request.
2. We forward the request to our external processing service.
3. The service sends a webhook with the final status (success or failed).
4. Separately, we run a scheduled **status-check job** to catch missed webhooks.
5. If a task fails → we restore the deducted credits back to the user's account.

But occasionally, **both the webhook and the job** would detect a failure at almost the same moment — and both triggered credit restorations. The result? The user's account balance increased **twice** 💸💸.

---



This concurrency race condition wasn't frequent — but in systems that track account balances, even one duplicate restoration is unacceptable.

---

## ⚙️ The Solution: Optimistic Locking

Instead of introducing complex distributed locks, we implemented a **lightweight optimistic locking** mechanism at the account record level.

### How It Works

Optimistic locking assumes that conflicts are *rare but possible*. It works like this:

- Each account row has a **version number** (an integer column).
- When a process wants to update the account balance, it checks the version number it last read.
- The update query succeeds only if the version hasn't changed.
- If another process already modified the account, the current update **fails gracefully** — triggering a retry or log instead of a duplicate restoration.

**Example schema:**

```sql
ALTER TABLE accounts ADD COLUMN version INT DEFAULT 0 NOT NULL;
```

**Example update query:**

```sql
UPDATE accounts
SET balance = balance + 100, version = version + 1
WHERE id = 123 AND version = 5;
```

If no row is affected (because the version has changed), the application knows **someone else already updated** it — avoiding duplicate operations.

---
![Abstract automation concept with blue and purple tones](https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?q=80&w=1170&h=460&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

---

## 🔑 Benefits

Implementing optimistic locking brought immediate benefits:

- 🧩 **Prevents duplicate operations or incorrect balances** even under high concurrency.
- ⚡ **No heavy database locks** — safe for distributed systems and background jobs.
- 🔁 **Easy to implement** for any entity where state accuracy is critical.
- 🤝 **Works perfectly with redundancy**, like webhook + scheduled job architecture.

---

## 🧪 Testing the System

Before deploying, we stress-tested the new logic to ensure it handled real-world concurrency.

**Test Scenarios:**

- Simulate **concurrent task failures** from both webhook and job processes using load-testing tools like **JMeter** or **Artillery**.
- Only **one restoration update** should succeed; others should detect a version conflict.
- Check account balances after each test — they must remain consistent.

**Expected Outcome:**

- ✅ One restoration succeeds.
- ⚠️ The second detects a version conflict and exits cleanly.
- 💰 Account balance remains correct.

---

## 🧭 Lessons Learned

1. Race conditions don't always appear in development — but they always exist in distributed systems.
2. **Optimistic locking** provides a clean, scalable safeguard without slowing down operations.
3. Monitoring and observability are just as important — logs must clearly show conflicts and retries.
4. Small design improvements like this can **prevent significant data integrity issues** and improve user trust.

---

![Server and code reflection in glass panels symbolizing concurrency safety](https://images.unsplash.com/photo-1605902711622-cfb43c4437d1?q=80&w=1600&auto=format&fit=crop)

### Final Thoughts

In systems that manage account state, concurrency control is just as critical as correctness. By adding a version-based optimistic lock to our account updates, we eliminated duplicate operations — without adding latency or operational complexity.

— *Protize Engineering Team*
