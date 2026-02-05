---
title: "Zero‑Downtime Migrations in NestJS with Scripted Workflows"
excerpt: "A practical case study on designing and shipping safe database migrations in NestJS using TypeORM/MikroORM, pnpm scripts, and CI/CD automation—without taking production down."
pubDate: 2025-11-06
updatedDate: 2025-11-06
author: "Protize Engineering Team"
tags: ["NestJS", "Migrations", "TypeORM", "MikroORM", "PostgreSQL", "CI/CD"]
category: "Backend Engineering"
featured: true
draft: false
coverImage: "https://images.unsplash.com/photo-1501526029524-a8ea952b15be?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
coverAlt: "Database migration flow diagram for NestJS services"
---

# Zero‑Downtime Migrations in NestJS with Scripted Workflows

High‑velocity product teams must evolve schemas frequently—new features, refactors, and performance fixes all require **database migrations**. Done poorly, migrations cause outages and data corruption. Done well, they are **boring**: repeatable, observable, and reversible.

This case study walks through Protize’s approach to **scripted, zero‑downtime migrations in NestJS**, covering workflow design, safety patterns, and automation in CI/CD.

---

## 1) Context & Problem

We run multiple NestJS services (Payments, Ledger, KYC, Settlements) against **PostgreSQL**. As transaction volume and feature complexity grew, we faced:

- Hot schemas with write‑heavy traffic (10k+ TPS windows).  
- Cross‑service coupling (foreign keys across bounded contexts).  
- Rollouts spanning **TypeORM** (legacy) and **MikroORM** (newer services).  
- Risk of long‑running locks during `ALTER TABLE` on large tables.

We needed a migration system that is:

- **Deterministic** (idempotent, versioned).  
- **Safe** (lock minimization, online changes).  
- **Automated** (local + CI/CD + rollback scripts).  
- **Observable** (timings, errors, checkpoints).

---

## 2) Tech Stack & Design Principles

- **NestJS** (v10) across services.  
- **TypeORM** (legacy services) + **MikroORM** (new services).  
- **PostgreSQL 16** with **pg_stat_activity** & **pg_locks** monitoring.  
- **pnpm** scripts to standardize developer commands.  
- **GitHub Actions** for CI, **Kubernetes Jobs** for prod execution.  
- Principle: **Migrate like code** → PR review, repeatable scripts, infra as code.

---

## 3) Folder Structure & Conventions

```
apps/
  payments/
    src/
    migrations/        # TypeORM .ts migrations (compiled to dist/migrations)
  ledger/
    src/
    migrations/        # MikroORM migrations
libs/
  db/
    src/
      data-source.ts   # TypeORM DataSource
      mikro.config.ts  # MikroORM config
package.json
pnpm-workspace.yaml
```

Naming: `YYYYMMDDHHmm__short_description.ts`

---

## 4) Scripts (pnpm) — One‑Liners for Devs & CI

```jsonc
// package.json (root)
{
  "scripts": {
    // TypeORM (Payments)
    "typeorm:gen": "ts-node apps/payments/src/cli/typeorm-gen.ts",
    "typeorm:run": "ts-node apps/payments/src/cli/typeorm-run.ts",
    "typeorm:revert": "ts-node apps/payments/src/cli/typeorm-revert.ts",

    // MikroORM (Ledger)
    "mikro:gen": "ts-node apps/ledger/src/cli/mikro-gen.ts",
    "mikro:up": "ts-node apps/ledger/src/cli/mikro-up.ts",
    "mikro:down": "ts-node apps/ledger/src/cli/mikro-down.ts",

    // Meta
    "migrate:all": "pnpm -w run typeorm:run && pnpm -w run mikro:up",
    "migrate:dry": "ENV=staging DRY_RUN=1 pnpm -w run migrate:all",
    "migrate:revert": "pnpm -w run typeorm:revert && pnpm -w run mikro:down"
  }
}
```

We wrap ORM CLIs with **typed Nest scripts**, injecting config, logging durations, and sending Slack alerts on failure.

---

## 5) Example: TypeORM DataSource & CLI

```ts
// libs/db/src/data-source.ts
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "1" ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: ["error"],
  entities: ["dist/apps/payments/**/*.entity.js"],
  migrations: ["dist/apps/payments/migrations/*.js"],
  namingStrategy: new SnakeNamingStrategy(),
});
```

```ts
// apps/payments/src/cli/typeorm-gen.ts
import { AppDataSource } from "@protize/db/data-source";
import { execSync } from "node:child_process";

(async () => {
  await AppDataSource.initialize();
  const name = process.argv[2] || "change";
  const out = `apps/payments/migrations/${Date.now()}__${name}`;
  execSync(`typeorm migration:generate ${out} -d dist/libs/db/src/data-source.js`, { stdio: "inherit" });
  await AppDataSource.destroy();
})();
```

```ts
// apps/payments/src/cli/typeorm-run.ts
import { AppDataSource } from "@protize/db/data-source";

(async () => {
  const t0 = Date.now();
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
  console.log(`[typeorm:run] done in ${Date.now() - t0}ms`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

---

## 6) Example: MikroORM Config & CLI

```ts
// libs/db/src/mikro.config.ts
import { defineConfig } from "@mikro-orm/postgresql";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  entities: ["dist/apps/ledger/**/*.entity.js"],
  entitiesTs: ["apps/ledger/**/*.entity.ts"],
  dbName: process.env.PG_DATABASE,
  clientUrl: process.env.DATABASE_URL,
  debug: false,
  migrations: {
    path: "apps/ledger/migrations",
    disableForeignKeys: true,
  },
});
```

```ts
// apps/ledger/src/cli/mikro-gen.ts
import { Migrator } from "@mikro-orm/migrations";
import mikroConfig from "@protize/db/mikro.config";

(async () => {
  const orm = await (await import("@mikro-orm/core")).MikroORM.init(mikroConfig);
  const migrator = orm.getMigrator();
  await migrator.createMigration(); // generates based on schema diff
  await orm.close(true);
})();
```

```ts
// apps/ledger/src/cli/mikro-up.ts
import { Migrator } from "@mikro-orm/migrations";
import mikroConfig from "@protize/db/mikro.config";

(async () => {
  const orm = await (await import("@mikro-orm/core")).MikroORM.init(mikroConfig);
  const migrator = orm.getMigrator();
  await migrator.up();
  await orm.close(true);
})();
```

---

## 7) Safe Patterns for Zero‑Downtime

> Golden rule: **deploy code that understands both old and new schemas** before flipping traffic.

**Additive First, Destructive Last**  
- Phase A (Add): add new columns/tables/indexes **nullable** or with defaults.  
- Phase B (Backfill): fill data via **background jobs** with batches (e.g., 5k rows).  
- Phase C (Dual‑write/Read): app writes to old+new columns; reads prefer new with fallback.  
- Phase D (Flip): remove dual‑write, switch reads.  
- Phase E (Clean): drop old columns/indexes **in a later release**.

**Lock‑Minimizing Tactics**  
- Avoid `ALTER COLUMN TYPE` directly → create new column, backfill, swap.  
- Create indexes **CONCURRENTLY** in Postgres.  
- For huge tables, partition by date/tenant.  
- Feature flags to gate code paths per service.

**Idempotency**  
- Migrations are pure functions of version; re‑running is a no‑op.  
- Backfills track progress in a control table `migration_progress`.

---

## 8) Example Migration: Add `utr` & `reported_at` to `chargebacks`

```ts
// apps/payments/migrations/202511061020__add_chargebacks_cols.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChargebacksCols202511061020 implements MigrationInterface {
  name = "AddChargebacksCols202511061020";

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE chargebacks ADD COLUMN IF NOT EXISTS utr varchar(64)`);
    await q.query(`ALTER TABLE chargebacks ADD COLUMN IF NOT EXISTS reported_at timestamptz`);
    await q.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS chargebacks_utr_idx ON chargebacks (utr)`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS chargebacks_utr_idx`);
    await q.query(`ALTER TABLE chargebacks DROP COLUMN IF EXISTS reported_at`);
    await q.query(`ALTER TABLE chargebacks DROP COLUMN IF EXISTS utr`);
  }
}
```

> Note: In Postgres, `CONCURRENTLY` cannot run inside a transaction. Configure TypeORM migration to **split** transactional blocks or create the index in a separate migration.

---

## 9) Backfill Job (NestJS Cron + Batches)

```ts
// apps/payments/src/backfills/chargebacks-utr.backfill.ts
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DataSource } from "typeorm";

@Injectable()
export class ChargebackUTRBackfill {
  constructor(private readonly ds: DataSource) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async run() {
    const batch = 5000;
    const qb = this.ds.createQueryRunner();
    await qb.connect();

    try {
      await qb.startTransaction();
      await qb.query(
        `
        WITH cte AS (
          SELECT id FROM chargebacks
          WHERE utr IS NULL
          ORDER BY id
          FOR UPDATE SKIP LOCKED
          LIMIT $1
        )
        UPDATE chargebacks c
        SET utr = gen_random_uuid()::text
        FROM cte
        WHERE c.id = cte.id;
        `,
        [batch]
      );
      await qb.commitTransaction();
    } catch (e) {
      await qb.rollbackTransaction();
      throw e;
    } finally {
      await qb.release();
    }
  }
}
```

**Why this works:** SKIP LOCKED prevents thundering herds; small batches minimize lock time.

---

## 10) CI/CD Orchestration

**CI (PR):**  
- Lint, test, **`pnpm typeorm:gen -- dry`** (no changes expected).  
- Spin ephemeral DB, run migrations, run tests.

**CD (Prod):**  
- Build images → apply K8s manifests.  
- **Pre‑deploy job:** `pnpm migrate:all` (Jobs with 5m timeout per migration).  
- On success: roll out app Deployments (`maxUnavailable: 0`, `maxSurge: 25%`).  
- On failure: auto‑run `pnpm migrate:revert`, alert Slack/Telegram.

---

## 11) Observability

- Log **start/end** with migration names, durations, and row counts.  
- Export metrics: `migrations_total`, `migrations_failed_total`, `backfill_rows_total`.  
- Dashboards: time spent by phase, locks observed, deadlocks.  
- Alert on long‑running statements > 60s on hot tables.

---

## 12) Rollback Strategy

- **Strict down() paths** for TypeORM/MikroORM migrations.  
- Store **DB dumps** for last known‑good before destructive phases.  
- Use **reversible toggles** (feature flags) to switch off new reads/writes.  
- Prefer **forward fixes**; if data shape changed, write compensating migrations.

---

## 13) Results

| Metric | Before | After |
|------:|------:|------:|
| Prod incidents during schema changes | Occasional | Near‑zero |
| Average migration wall time | Unpredictable | < 90s |
| Rollback time | Manual / slow | Scripted (< 2m) |
| Developer setup friction | High | One‑liners via pnpm |

---

## 14) Pitfalls & Tips

1. Do not run `CREATE INDEX CONCURRENTLY` inside a transaction.  
2. Avoid `DROP COLUMN` in the same release that introduces a replacement.  
3. Backfills should be retry‑safe and chunked.  
4. Keep **entity** and **migration** versions pinned; avoid dev drift.  
5. Always test upgrade **and** downgrade on a realistic snapshot.

---

## 15) Conclusion

With **scripted migrations**, **idempotent backfills**, and **observability**, schema changes stopped being risky. Engineers ship features faster, SREs sleep better, and merchants see no downtime—exactly how migrations should be.

---

### Appendix A — Minimal Makefile (optional)

```makefile
gen:
	pnpm typeorm:gen change
run:
	pnpm migrate:all
revert:
	pnpm migrate:revert
```

### Appendix B — GitHub Action (snippet)

```yaml
name: migrate
on:
  workflow_dispatch: {}
jobs:
  run-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm migrate:all
```

---

*Authored by the Protize Engineering Team — November 2025.*
