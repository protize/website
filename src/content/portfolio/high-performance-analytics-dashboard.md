---
title: "Building a High-Performance Analytics Dashboard with Tremor and Next.js"
excerpt: "How Protize shipped a lightning-fast analytics dashboard using Tremor components, Next.js App Router, and a time-series API with server actions."
pubDate: 2025-11-06
updatedDate: 2025-11-06
author: "Protize Engineering Team"
tags: ["Tremor", "Next.js", "Analytics", "Dashboard", "Performance"]
category: "Frontend Engineering"
featured: true
draft: false
coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
coverAlt: "High-performance analytics dashboard UI"
---

# Building a High-Performance Analytics Dashboard with Tremor and Next.js

When merchants ask, “How are my transactions doing right now?” they expect millisecond-fast answers.  
We built a **real-time analytics dashboard** that renders time-series payins, payouts, and chargebacks with **Tremor** UI components on top of **Next.js (App Router)** and a scalable **time-series API**.

---

## 1) Goals

1. <10ms p95 render for client interactions (filter/pan/zoom).  
2. Streaming-first UX for “hot” data (last 60 minutes).  
3. Consistent chart contracts across payins, payouts, and chargebacks.  
4. A design system-friendly approach using Tremor + Tailwind.

---

## 2) Architecture Overview

- **Next.js App Router** with server components for data-fetching near the edge.  
- **Server Actions** to call the analytics API with cache tags by `merchantId + interval`.  
- **Tremor** components for charts, KPIs, and cards.  
- **Edge Caching** (revalidate tag) to invalidate only affected ranges.  
- **Progressive Rendering**: skeletons + streaming payloads.  

High-level flow:

1. User selects date range + interval.  
2. Client posts filter to a **server action**.  
3. Server action queries the **Time-Series API**.  
4. Results are normalized, cached by tags, and streamed back.  
5. Tremor charts animate with new data without reflowing the layout.

---

## 3) Data Contract (Time-Series API)

The API returns an array of buckets, each with `timestamp`, `count`, `amount`, and `status`.  
Example (trimmed):

```json
[
  { "timestamp": "2025-11-06T06:15:00.000Z", "count": 87, "amount": 143200, "status": "success" },
  { "timestamp": "2025-11-06T06:30:00.000Z", "count": 102, "amount": 168900, "status": "success" }
]
```

Normalization step guarantees:
- Every bucket boundary is present for the chosen interval.  
- Missing ranges are backfilled with zeros for stable chart axes.  

---

## 4) Example: Server Action

```ts
// app/(dashboard)/actions.ts
"use server";

import "server-only";
import { revalidateTag } from "next/cache";

type Query = {
  merchantId: string;
  from: string; // ISO
  to: string;   // ISO
  interval: "15m" | "1h" | "1d";
  kind: "payins" | "payouts" | "chargebacks";
};

export async function getAnalytics(q: Query) {
  const tag = `analytics:${q.merchantId}:${q.kind}:${q.interval}`;
  const url = `${process.env.ANALYTICS_URL}/v1/series?merchantId=${q.merchantId}&from=${q.from}&to=${q.to}&interval=${q.interval}&kind=${q.kind}`;

  const res = await fetch(url, {
    next: { tags: [tag], revalidate: 60 },
    headers: { Authorization: `Bearer ${process.env.ANALYTICS_TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`Analytics fetch failed: ${res.status}`);
  }

  const raw = await res.json();
  return normalizeBuckets(raw);
}

// Ensures sorted buckets, backfilled gaps, and numeric coercion
function normalizeBuckets(raw: any[]) {
  // ...implementation specific to your API...
  return raw;
}

export async function revalidateAnalyticsTag(tag: string) {
  revalidateTag(tag);
}
```

---

## 5) Tremor Composition

We used **`<AreaChart />`** for time-series and **`<BarList />`** for categorical breakdowns.

```tsx
// app/(dashboard)/components/Timeseries.tsx
"use client";

import { Card, AreaChart, Title, Text } from "@tremor/react";

export function Timeseries({ data, title, category = "amount" }: any) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <Title>{title}</Title>
      <Text className="mt-1">Live interval view</Text>
      <AreaChart
        className="mt-4 h-64"
        data={data}
        index="timestamp"
        categories={[category]}
        // no explicit colors to keep theme-compatible
        yAxisWidth={56}
        showLegend={false}
        curveType="monotone"
        autoMinValue
      />
    </Card>
  );
}
```

---

## 6) Performance Techniques

- **Stable Keys + Suspense Boundaries** to avoid unnecessary re-renders.  
- **`next/dynamic`** for heavyweight widgets gated by visibility.  
- **Memoized transforms** (e.g., `useMemo`) for large arrays.  
- **Web Workers** for bucketing on the client when zooming across huge ranges.  
- **HTTP/2 & compression** for faster payloads (Gzip/Brotli).  
- **Row/Virtualized tables** for large detail views.

---

## 7) Accessibility & UX

- Keyboard navigable filters and chart tooltips.  
- High-contrast themes and reduced motion preference detection.  
- Empty states: “No data for this range — try 24h.”  
- Persistent URL query parameters for shareable views.

---

## 8) Results

| Metric | Before | After |
|-------:|-------:|------:|
| p95 page TTFB | 480ms | 120ms |
| p95 client interactivity | 340ms | 85ms |
| Bundle size (hydrated) | 620KB | 290KB |
| Support tickets (reporting) | High | Low |

---

## 9) What We’d Do Next

- Add **windowed querying** for >90-day views.  
- Integrate **anomaly detection** for spikes and drops.  
- Build **embeddable widgets** for merchant sites.

---

*Authored by the Protize Engineering Team — November 2025.*
