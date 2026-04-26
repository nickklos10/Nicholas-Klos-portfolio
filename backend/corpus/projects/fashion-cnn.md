---
title: Fashion-MNIST CNN
slug: fashion-cnn
kind: project
tags: [pytorch, deep-learning]
---

A convolutional classifier over Fashion-MNIST, written from scratch in
PyTorch. No off-the-shelf training loop, no pre-built architecture — the
point was to feel the loss curve in my bones rather than treat it as a black
box.

**Stack:** PyTorch, torchvision, matplotlib.

**Outcomes:**
- Custom CNN architecture, no off-the-shelf wrapper.
- Reproducible training and evaluation.
- Loss + accuracy curves committed to the repo.

**What was hard.** Nothing dramatic. The point of the project was deliberate
practice — knowing at the lowest level what a forward pass, a backward pass,
and a step of SGD actually do. That's the kind of project I keep around for
the moments when a higher-level framework starts behaving strangely.

**Lesson:** train one from scratch before you reach for the framework.

Repo: https://github.com/nickklos10/fashion-mnist-cnn-classifier
