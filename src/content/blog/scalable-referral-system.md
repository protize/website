---
title: "Designing a Scalable Referral System with Node.js and React"
description: "Architecting a robust, secure, and easily trackable referral system using modern JavaScript technologies."
pubDate: 2026-04-14
author: "Protize Team"
tags: ["nodejs", "react", "architecture", "system-design", "referral"]
category: "Architecture"
coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
coverAlt: "People collaborating, representing network growth and referrals"
---

Referral systems are one of the most powerful and cost-effective growth strategies a company can adopt. Think about how Dropbox grew from 100,000 to 4 million users in just 15 months — referrals were at the core of it. But building a referral system that is robust, fraud-resistant, and accurately tracks conversions is far more complicated than it appears on the surface.

In this blog, we'll walk through how to architect a production-grade referral system using **Node.js** on the backend and **React** on the frontend. By the end, you'll have a clear picture of how each piece fits together — from generating unique codes to crediting rewards atomically.

---

## Why Referral Systems Are Hard

On the surface, a referral system sounds simple: give each user a unique link, and when someone signs up using that link, reward both parties. But the devil is in the details:

- **Race conditions:** Two users converting at the same time could both get credited if you're not using transactions.
- **Fraud:** People creating fake accounts to farm rewards.
- **Code collisions:** Two users accidentally getting the same referral code.
- **Tracking loss:** The user clicks a referral link, browses for 10 minutes, then signs up — the referral context must persist.

Let's solve each of these systematically.

---

## Step 1: Database Schema

Start with a clean schema that supports the full referral lifecycle:

```sql
-- Users table with referral tracking
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  credits     INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Referral codes — one per user
CREATE TABLE referral_codes (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  code        VARCHAR(20) UNIQUE NOT NULL,  -- UNIQUE constraint is critical
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Track every successful referral conversion
CREATE TABLE referral_conversions (
  id              SERIAL PRIMARY KEY,
  referrer_id     INTEGER NOT NULL REFERENCES users(id),
  referred_id     INTEGER NOT NULL REFERENCES users(id),
  reward_paid_at  TIMESTAMP,              -- NULL until reward is confirmed
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(referred_id)                     -- One user can only be referred once
);
```

The `UNIQUE` constraint on `code` is your safety net. Even if two server instances try to insert the same code simultaneously, the database will reject one of them.

---

## Step 2: Generating Unique Referral Codes

Every user needs a unique, human-friendly referral code when they register. We use `nanoid` for short, URL-safe codes:

```bash
npm install nanoid
```

```javascript
// services/referral.service.js
const { nanoid } = require('nanoid');
const db = require('../db');

async function generateReferralCode(userId) {
  const MAX_RETRIES = 5;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = nanoid(8); // e.g., "V1StGXR8"

    try {
      await db.query(
        'INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)',
        [userId, code]
      );
      return code; // Success — return the code
    } catch (error) {
      // If it's a unique constraint violation, retry
      if (error.code === '23505') {
        continue;
      }
      throw error; // Unexpected error — rethrow
    }
  }

  throw new Error('Failed to generate a unique referral code after 5 attempts');
}

async function getReferralCode(userId) {
  const result = await db.query(
    'SELECT code FROM referral_codes WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.code || null;
}

module.exports = { generateReferralCode, getReferralCode };
```

---

## Step 3: Tracking Referral Clicks on the React Frontend

When a user shares their referral link — `https://yourapp.com/signup?ref=V1StGXR8` — and someone clicks it, the React app must capture and persist that code through the entire signup process. The user might spend 10 minutes reading your homepage before signing up.

```bash
npm install js-cookie react-router-dom
```

```jsx
// pages/SignupPage.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import SignupForm from '../components/SignupForm';

export default function SignupPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store in cookie — persists for 30 days across page navigations
      Cookies.set('referral_code', refCode, {
        expires: 30,
        secure: true,       // HTTPS only
        sameSite: 'Strict', // CSRF protection
      });
      console.log(`Referral code captured: ${refCode}`);
    }
  }, [searchParams]);

  async function handleSignup(formData) {
    // Retrieve referral code from cookie at signup time
    const referralCode = Cookies.get('referral_code');

    const payload = {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      referralCode: referralCode || null,
    };

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Clean up — remove the referral cookie after successful signup
      Cookies.remove('referral_code');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  }

  return (
    <div className="signup-page">
      <h1>Create Your Account</h1>
      <SignupForm onSubmit={handleSignup} />
    </div>
  );
}
```

---

## Step 4: The Referral Dashboard Component

Show users their referral stats and make it easy to share their link:

```jsx
// components/ReferralDashboard.jsx
import { useState, useEffect } from 'react';

export default function ReferralDashboard({ userId }) {
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/referrals/stats/${userId}`)
      .then(res => res.json())
      .then(setStats);
  }, [userId]);

  const referralLink = `https://yourapp.com/signup?ref=${stats?.code}`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="referral-dashboard">
      <h2>Your Referral Program</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="number">{stats.totalReferrals}</span>
          <span className="label">Total Referrals</span>
        </div>
        <div className="stat-card">
          <span className="number">{stats.pendingRewards}</span>
          <span className="label">Pending Rewards</span>
        </div>
        <div className="stat-card">
          <span className="number">${stats.totalEarned}</span>
          <span className="label">Total Earned</span>
        </div>
      </div>

      <div className="referral-link-section">
        <label>Your Referral Link</label>
        <div className="link-box">
          <input value={referralLink} readOnly />
          <button onClick={copyLink}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Atomic Conversion on the Backend

This is the most critical part of the entire system. When a referred user signs up, you must update both users' accounts in a **single atomic transaction**. If any step fails, everything rolls back — no partial credits, no orphaned records.

```javascript
// controllers/auth.controller.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { generateReferralCode } = require('../services/referral.service');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const REFERRAL_REWARD_CREDITS = 10;

async function registerUser(req, res) {
  const { email, name, password, referralCode } = req.body;

  // Validate input
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the new user
    const userResult = await client.query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id',
      [email, name, passwordHash]
    );
    const newUserId = userResult.rows[0].id;

    // Generate referral code for the new user
    await generateReferralCode(newUserId);

    // Process referral if a valid code was provided
    if (referralCode) {
      const referrerResult = await client.query(
        `SELECT rc.user_id
         FROM referral_codes rc
         JOIN users u ON u.id = rc.user_id
         WHERE rc.code = $1`,
        [referralCode]
      );

      if (referrerResult.rows.length > 0) {
        const referrerId = referrerResult.rows[0].user_id;

        // Prevent self-referral
        if (referrerId !== newUserId) {
          // Credit the referrer
          await client.query(
            'UPDATE users SET credits = credits + $1 WHERE id = $2',
            [REFERRAL_REWARD_CREDITS, referrerId]
          );

          // Log the conversion
          await client.query(
            `INSERT INTO referral_conversions (referrer_id, referred_id)
             VALUES ($1, $2)`,
            [referrerId, newUserId]
          );

          console.log(`Referral credited: User ${referrerId} earned ${REFERRAL_REWARD_CREDITS} credits`);
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      userId: newUserId,
      message: 'Account created successfully',
    });

  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      // Unique constraint violation — email already exists
      return res.status(409).json({ error: 'Email already in use' });
    }

    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });

  } finally {
    client.release();
  }
}

module.exports = { registerUser };
```

---

## Step 6: Fraud Prevention

A referral system without fraud prevention is a money-printing machine for bad actors. Here are the most effective safeguards:

### 1. One Referral Per Email Domain (Block Disposable Emails)

```javascript
// middleware/validateEmail.js
const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com',
  'throwaway.email', '10minutemail.com', 'yopmail.com'
];

function isDisposableEmail(email) {
  const domain = email.split('@')[1].toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
}

function validateEmail(req, res, next) {
  if (isDisposableEmail(req.body.email)) {
    return res.status(400).json({
      error: 'Disposable email addresses are not allowed'
    });
  }
  next();
}

module.exports = { validateEmail };
```

### 2. IP-Based Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,                    // 3 signups per IP per hour
  message: { error: 'Too many accounts created from this IP, try again later' },
  keyGenerator: (req) => req.ip,
});

// Apply to registration route
app.post('/api/auth/register', signupLimiter, validateEmail, registerUser);
```

### 3. Delayed Reward Payout

Don't pay out referral rewards immediately. Wait 7–14 days to allow for refunds or account verification:

```javascript
// cron job — runs daily
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  const client = await pool.connect();
  try {
    // Pay out conversions that are 7+ days old and not yet rewarded
    const conversions = await client.query(`
      SELECT * FROM referral_conversions
      WHERE reward_paid_at IS NULL
      AND created_at < NOW() - INTERVAL '7 days'
    `);

    for (const conversion of conversions.rows) {
      await client.query('BEGIN');
      await client.query(
        'UPDATE users SET credits = credits + $1 WHERE id = $2',
        [REFERRAL_REWARD_CREDITS, conversion.referrer_id]
      );
      await client.query(
        'UPDATE referral_conversions SET reward_paid_at = NOW() WHERE id = $1',
        [conversion.id]
      );
      await client.query('COMMIT');
    }
  } finally {
    client.release();
  }
});
```

---

## Conclusion

A well-built referral system is a multiplier for your growth. By generating unique codes safely with database-level uniqueness constraints, persisting referral context on the frontend using cookies, committing conversions atomically on the backend with PostgreSQL transactions, and defending against fraud with rate limiting and delayed payouts — you create a system your users can trust and your business can rely on.

The best part? Once it's running, it works for you 24/7 without any additional marketing spend.
