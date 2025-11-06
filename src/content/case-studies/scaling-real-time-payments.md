---
title: "Scaling Real-Time Payments Infrastructure with NestJS and PostgreSQL"
excerpt: "How Protize scaled its fintech-grade payment gateway to handle millions of daily transactions using NestJS, PostgreSQL, and Redis."
pubDate: 2025-11-06
updatedDate: 2025-11-06
author: "Protize Engineering Team"
tags: ["NestJS", "PostgreSQL", "Fintech", "Scalability", "Microservices"]
category: "Backend Engineering"
featured: true
draft: false
coverImage: "https://images.unsplash.com/photo-1757301714935-c8127a21abc6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1160"
coverAlt: "Real-time payment infrastructure visualization"
---

# Scaling Real-Time Payments Infrastructure with NestJS and PostgreSQL

In today’s digital economy, payment gateways must process thousands of concurrent transactions with near-zero latency. At Protize, we faced the challenge of scaling our real-time payments platform while maintaining reliability, observability, and compliance. This case study explores how our engineering team architected a system capable of handling over a million transactions per day with **NestJS, PostgreSQL, and Redis** at its core.

---

## 1. Background

Our platform serves merchants across fintech, gaming, and e-commerce domains. As transaction volume grew 10× within six months, we observed:
- Increased database contention.
- Slow API response times.
- Inefficient retry mechanisms during payment spikes.
- Occasional deadlocks in concurrent settlement processing.

The engineering mandate was clear — **scale horizontally without sacrificing data integrity or developer velocity**.

---

## 2. Architectural Goals

The team outlined three primary goals:

1. **Throughput** — Achieve 10,000+ TPS across Payin and Payout modules.  
2. **Consistency** — Ensure ACID guarantees across all transaction stages.  
3. **Observability** — Enable real-time insight into queue health and DB metrics.

---

## 3. Core Tech Stack

- **NestJS (v10)** for modular backend architecture.  
- **PostgreSQL (v16)** for transactional storage and ACID compliance.  
- **Redis (ElasticCache)** for caching, job queues, and distributed locks.  
- **BullMQ** for asynchronous job processing and retry orchestration.  
- **TypeORM** for relational mapping and migrations.  
- **Grafana + Prometheus + New Relic** for monitoring and alerting.

---

## 4. Database Optimization

We restructured key tables and introduced **partitioning by date and merchant ID**, significantly reducing index bloat. Heavy queries were moved into **materialized views**, refreshed via CRON every 10 minutes.

Indexes were created using `btree_gist` for conflict-free upserts, improving transactional consistency in high-load scenarios. Write-heavy operations were batched using PostgreSQL's `COPY` command for bulk inserts.

---

## 5. Queue and Event System

Every payment event (Payin, Payout, Chargeback) is processed via **BullMQ queues**.  
We implemented **queue prioritization** — ensuring critical refund workflows are always executed ahead of analytics jobs.

Retries were handled with exponential backoff, and each job emitted structured logs for monitoring queue latency in New Relic dashboards.

---

## 6. Horizontal Scaling with NestJS Microservices

NestJS microservices allowed us to scale API and worker nodes independently.  
Each module (e.g., Payin, Payout, Settlement) runs on its own Redis-based event bus.  
This eliminated single points of failure and improved deployment flexibility via Kubernetes.

---

## 7. Observability and Alerts

We established a multi-layer monitoring approach:

- Application metrics exported to **Prometheus**.  
- Traces visualized through **New Relic APM**.  
- Alerting via **Slack** and **Telegram bots** for failed jobs and low wallet balances.

Every component publishes a heartbeat event, enabling self-healing automation when anomalies are detected.

---

## 8. Results

| Metric | Before | After |
|--------|--------|-------|
| Avg TPS | 1,200 | 11,800 |
| 99th percentile latency | 800ms | 130ms |
| Downtime (monthly) | 4 hrs | < 10 mins |
| Incident response | Manual | Automated |

---

## 9. Lessons Learned

1. Observability must evolve with architecture.  
2. Database partitioning is a game-changer at scale.  
3. Queue backpressure management prevents cascading failures.  
4. Developer autonomy improves release velocity.

---

## 10. Conclusion

This initiative transformed Protize’s payment infrastructure into a self-scaling, fault-tolerant, and insight-rich system.  
The combination of **NestJS microservices**, **PostgreSQL partitioning**, and **Redis-backed queue orchestration** allowed us to achieve fintech-grade scalability while maintaining simplicity and transparency across teams.

Our next milestone is to integrate **AI-driven anomaly detection** into transaction analytics — enabling real-time fraud prevention and smart routing decisions.

---

*Authored by the Protize Engineering Team — November 2025.*
