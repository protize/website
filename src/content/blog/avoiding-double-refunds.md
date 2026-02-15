---
title: "Avoiding Double Refunds: How We Solved a Race Condition in Our Payout System"
description: "How we used optimistic locking to prevent double refunds and maintain wallet accuracy under high concurrency."
pubDate: "2026-02-10"
author: "Protize Engineering"
tags: ["fintech", "payouts", "concurrency", "optimistic-locking", "wallet-system"]
category: "Engineering"
coverImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
coverAlt: "Abstract digital transaction visualization with glowing network nodes"
draft: false
---

When two processes — the **webhook response** and the **status-check job** — handled failed payouts simultaneously, our users sometimes got refunded **twice**. This post explains how our payout system encountered a concurrency issue and how we fixed it using **optimistic locking**.

---

## 💥 The Problem

At first glance, our payout flow looked simple:

1. A user requests a payout.  
2. We send the request to our acquirer.  
3. The acquirer sends a webhook with the final status (success or failed).  
4. Separately, we run a scheduled **status-check job** to catch missed webhooks.  
5. If a payout fails → we refund the amount to the user's wallet.

But occasionally, **both the webhook and the job** would detect a failure at almost the same moment — and both triggered refunds. The result? The user’s wallet balance increased **twice** 💸💸.

---

![Abstract fintech automation concept with blue and purple tones](https://images.unsplash.com/photo-1556741533-f6acd647d2fb?q=80&w=1600&auto=format&fit=crop)

This concurrency race condition wasn’t frequent — but in financial systems, even one duplicate refund is unacceptable.

---

## ⚙️ The Solution: Optimistic Locking

Instead of introducing complex distributed locks, we implemented a **lightweight optimistic locking** mechanism at the wallet level.

### How It Works

Optimistic locking assumes that conflicts are *rare but possible*. It works like this:

- Each wallet row has a **version number** (an integer column).  
- When a process wants to update the wallet balance, it checks the version number it last read.  
- The update query succeeds only if the version hasn't changed.  
- If another process already modified the wallet, the current update **fails gracefully** — triggering a retry or log instead of a duplicate refund.

**Example schema:**

```sql
ALTER TABLE wallets ADD COLUMN version INT DEFAULT 0 NOT NULL;
```

**Example update query:**

```sql
UPDATE wallets
SET balance = balance + 100, version = version + 1
WHERE id = 123 AND version = 5;
```

If no row is affected (because the version has changed), the application knows **someone else already updated** it — avoiding double refunds.

---

![Database transaction locks visualized as nodes with concurrency arrows](https://images.unsplash.com/photo-1605902711622-cfb43c4437d1?q=80&w=1600&auto=format&fit=crop)

---

## 🔑 Benefits

Implementing optimistic locking brought immediate benefits:

- 🧩 **Prevents double refunds or incorrect balances** even under high concurrency.  
- ⚡ **No heavy database locks** — safe for distributed systems and jobs.  
- 🔁 **Easy to implement** for any entity where state accuracy is critical.  
- 🤝 **Works perfectly with redundancy**, like webhook + scheduled job architecture.

---

## 🧪 Testing the System

Before deploying, we stress-tested the new logic to ensure it handled real-world concurrency.

**Test Scenarios:**

- Simulate **concurrent payout failures** from both webhook and job processes using load-testing tools like **JMeter** or **Artillery**.  
- Only **one refund update** should succeed; others should detect a version conflict.  
- Check wallet balances after each test — they must remain consistent.

**Expected Outcome:**

- ✅ One refund succeeds.  
- ⚠️ The second detects a version conflict and exits.  
- 💰 Wallet balance remains correct.

---

## 🧭 Lessons Learned

1. Race conditions don’t always appear in development — but they always exist in distributed systems.  
2. **Optimistic locking** provides a clean, scalable safeguard without slowing down transactions.  
3. Monitoring and observability are just as important — logs must clearly show conflicts and retries.  
4. Small design improvements like this can **save massive financial losses** and improve user trust.

---

![Server and code reflection in glass panels symbolizing concurrency safety](https://images.unsplash.com/photo-1605902711622-cfb43c4437d1?q=80&w=1600&auto=format&fit=crop)

### Final Thoughts

In payment systems, concurrency control is just as critical as correctness. By adding a version-based optimistic lock to our wallet updates, we eliminated duplicate refunds — without adding latency or operational complexity.


— *Protize Engineering Team*
