---
title: "Enhancing Transaction Security Using AWS WAF and Redis-Based Rate Limiting"
excerpt: "How Protize hardened its payment APIs against fraud and abuse with AWS WAF managed rules, custom bot controls, and Redis-backed rate limiting."
pubDate: 2025-11-06
updatedDate: 2025-11-06
author: "Protize Engineering Team"
tags: ["AWS WAF", "Security", "Rate Limiting", "Redis", "Fintech"]
category: "Security Engineering"
featured: true
draft: false
coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
coverAlt: "Shield icon with traffic metrics dashboard"
---

# Enhancing Transaction Security Using AWS WAF and Redis-Based Rate Limiting

Fraud attempts and abusive traffic often spike during promotional events, merchant go‑lives, or seasonal peaks.  
Protize adopted a layered defense strategy combining **AWS WAF** for L7 filtering with **Redis-based rate limiting** at the application edge to protect APIs, preserve capacity, and ensure predictable latency under attack.

---

## 1) Threat Landscape

- Credential stuffing against checkout endpoints.  
- Card testing and high‑velocity retries on payment authorization.  
- Bots scraping OTP flows and abusing free‑trial signups.  
- Burst traffic from misconfigured client SDKs causing thundering herds.

Our goal: **block bad traffic early**, **throttle suspicious clients gracefully**, and **never degrade service for good users**.

---

## 2) Architecture at a Glance

1. **CloudFront → AWS WAF** enforces managed rules + custom rulesets.  
2. **ALB → NestJS API** terminates TLS and forwards to service pods.  
3. **Redis (Elasticache)** stores counters, token buckets, and sliding windows per **IP, merchantId, API key, and route**.  
4. **Async audit pipeline** mirrors suspicious requests to a risk topic for offline analysis and model training.

---

## 3) AWS WAF Ruleset Strategy

- **AWS Managed Rule Groups**: `AWSManagedRulesCommonRuleSet`, `BotControl`, `KnownBadInputs`.  
- **Rate-Based Rules**: per IP and per country spikes (`count` vs `block` actions).  
- **Custom Regex rules**: protect `/auth/*`, `/otp/*`, and `/payments/*` with tight method + header checks.  
- **Geo match** and **IP reputation lists** to dampen known malicious ASNs.  
- **Labeling**: Every WAF match adds labels (e.g., `waf.bot`, `waf.rate`) forwarded via headers for app decisions.

**Observability:** Sampled requests are shipped to **Kinesis Firehose → S3** for Athena queries and dashboards.

---

## 4) Redis-Based Rate Limiting (App Edge)

We implemented a **sliding window + token bucket hybrid**:

- **Sliding window** ensures fairness over time (per 1s/10s/1m).  
- **Token bucket** allows short bursts for legitimate spikes.  
- Keys are composed as `rl:{route}:{merchantId}:{apiKey}:{ip}`.  
- Limits are tied to **merchant plan** (Premium, Standard, Sandbox).  
- Exemptions for our **internal IPs**, **monitoring**, and **whitelisted webhooks**.

### Pseudocode Sketch
```ts
function checkLimit(key, limit, windowMs, burst) {
  const now = Date.now();
  // 1) consume burst tokens first
  const tokens = redis.decrby(`${key}:burst`, 1);
  if (tokens >= 0) return allow();

  // 2) sliding window count
  redis.zadd(`${key}:win`, now, `${now}`);
  redis.zremrangebyscore(`${key}:win`, 0, now - windowMs);
  const count = redis.zcard(`${key}:win`);

  if (count > limit) return block();
  return allow();
}
```

---

## 5) Coordinating WAF and App Limits

- **WAF** blocks obvious bad traffic and volumetric spikes close to the edge.  
- **App rate limits** differentiate by merchant, API key, and route where business context matters.  
- **WAF labels** (`x-waf-labels`) are propagated to the app for risk scoring and logging.  
- **429 with `Retry-After`** is returned for throttled clients; WAF blocks receive a standard 403 JSON envelope to ease client debugging.

---

## 6) Securing OTP & Auth Flows

- **Device fingerprinting** (UA + IP + cookie entropy) used to set stricter OTP caps.  
- **One‑tap resend cooldowns** backed by Redis keys.  
- **Per‑phone** and **per-IP** sliding windows protect SMS providers and costs.  
- **Honeypot params** catch simple bots without impacting UX.

---

## 7) Incident Playbook & Automation

- Anomaly alerts flow to **Slack** and **Telegram** with route and merchant tags.  
- **Auto‑mitigation** upgrades rules (e.g., move `count → block`) for 15 minutes after a threshold.  
- **Runbooks** let on-call engineers toggle rule severity via a small admin UI.  
- **Post‑incident** analysis links WAF logs with app metrics to prevent regressions.

---

## 8) Results

| Metric | Before | After |
|-------:|------:|------:|
| Card testing success window | > 2 hours | < 10 minutes |
| OTP spam during promo peaks | Frequent | Rare |
| P95 latency under attack | 900ms | 180ms |
| False positives (weekly) | Moderate | Low |

---

## 9) Lessons Learned

1. Push coarse‑grained blocks to the edge (WAF); keep fine‑grained controls in the app.  
2. Sliding windows + small bursts keep UX smooth while containing abuse.  
3. Labels from WAF → App create powerful, explainable risk signals.  
4. Always send machine‑readable error bodies for blocked/throttled traffic.

---

## 10) Next Steps

- Integrate **score‑based adaptive limits** using recent merchant traffic.  
- Add **per‑route dynamic limits** controlled by feature flags.  
- Feed WAF + app signals into a **fraud scoring model** for real‑time routing.

---

*Authored by the Protize Engineering Team — November 2025.*
