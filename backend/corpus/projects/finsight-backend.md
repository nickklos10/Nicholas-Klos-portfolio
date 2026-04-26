---
title: Finsight — Personal Finance Tracker (Backend)
slug: finsight-backend
kind: project
tags: [java, spring-boot, postgres, auth0, docker]
---

A Spring Boot REST API for a personal finance tracker. Auth0-protected
endpoints with scope-level authorisation, PostgreSQL persistence with proper
migrations, dockerised for local dev parity with the deployed environment.

**Stack:** Spring Boot, Java 21, PostgreSQL, Auth0, Docker.

**Outcomes:**
- Auth0-protected REST endpoints with fine-grained scope checks.
- PostgreSQL schema with versioned migrations.
- Docker compose for local dev parity with prod.

**What was hard.** Auth done right is detail-heavy. Getting JWT validation,
scope-to-permission mapping, and ownership checks correct end-to-end took
longer than building the rest of the API. But once that scaffolding existed,
adding new endpoints was almost free.

**Lesson:** auth done right at the start saves weeks later.

Repo: https://github.com/nickklos10/Finance-Tracker-backend
