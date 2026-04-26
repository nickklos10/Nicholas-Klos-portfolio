---
title: Florida Solar Energy Center — Undergraduate Researcher (2022 — 2023)
slug: experience-fsec
kind: bio
---

Undergraduate research assistant at the Florida Solar Energy Center, in UCF's
Department of Computer Science. The project was statistical analysis and
machine learning on solar panel performance under varying environmental
conditions — temperature, humidity, dust, partial shading.

The dataset was big and messy: about 1.5 million data points spanning multiple
panel types and sites, with roughly 500 GB/week of new measurement data
flowing in. Most of the work was making the data trustworthy: fixing logger
clock drift, deduplicating overlapping ingest windows, building idempotent
ETL.

The model work was satisfying once the data was clean. I improved prediction
accuracy by about 25% over the prior baseline, mostly through feature
engineering rather than model architecture changes. That's the lesson that
stuck: cleaner features beat fancier models, almost always.
