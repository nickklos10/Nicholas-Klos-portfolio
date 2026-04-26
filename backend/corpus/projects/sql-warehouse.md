---
title: SQL Data Warehouse
slug: sql-warehouse
kind: project
tags: [sql, postgres, etl, data-modeling]
---

A medallion-architecture data warehouse on PostgreSQL: bronze (raw ingest) →
silver (cleansed and conformed) → gold (BI-ready dimensional models), with
reproducible ETL between layers. The goal was to build something that an
analyst could actually trust — re-runnable, idempotent, with explicit
contracts at each layer boundary.

**Stack:** PostgreSQL, SQL, ETL scripts, dimensional modelling.

**Outcomes:**
- Bronze / silver / gold layers with documented contracts.
- Idempotent ETL — re-runs are safe and produce identical results.
- Gold-layer marts that BI queries can hit directly.

**What was hard.** Idempotency is harder than it looks once you start handling
late-arriving data. I redesigned the silver-layer dedup logic three times
before it was both fast and correct.

**Lesson:** if the layers aren't clean, the dashboards lie.

Repo: https://github.com/nickklos10/sql-data-warehouse
