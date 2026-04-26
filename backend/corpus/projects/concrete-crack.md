---
title: Concrete Crack Detector
slug: concrete-crack
kind: project
tags: [cv, pytorch, fastapi, aws, docker]
---

A full-stack computer vision app: a fine-tuned vision model behind a FastAPI
service, dockerised, deployed to AWS, with a Next.js front-end for upload and
classification. The end product is a "drag in a photo of concrete, get back
crack / no-crack" demo, but the meaningful work was everything around the
model.

**Stack:** PyTorch, torchvision, FastAPI, Docker, AWS (ECR + EC2), Next.js.

**Outcomes:**
- Trained and served a binary crack classifier.
- Containerised and deployed to AWS.
- Front-end upload/inference flow with sensible error states.

**What was hard.** The model was the easy part — fine-tuning a torchvision
backbone on a labelled crack dataset is a tutorial. The deploy ate more time
than the model: image size, cold-start latency, getting the network paths
right between the front-end host and the FastAPI host, and writing health
checks that actually mean "ready to serve" instead of "process is alive".

**Lesson:** the deploy is half the project.

Repo: https://github.com/nickklos10/Concrete-Crack-Detector-CV
