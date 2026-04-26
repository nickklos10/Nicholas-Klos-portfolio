---
title: Serie A Standings Prediction
slug: serie-a
kind: project
tags: [ml, sklearn, shap]
---

Scraped historical Serie A match data, engineered features (form, head-to-head,
home/away splits, rest days, goal differential trajectories), and trained
classical ML models to predict the final 2024–25 table. Used SHAP to
interrogate which features actually drove the predictions — not because it
matters for accuracy, but because predictions you can't explain are
predictions you can't trust.

**Stack:** Keras, TensorFlow, scikit-learn, pandas, SHAP, BeautifulSoup.

**Outcomes:**
- Beat the naive "last season's table" baseline on a held-out split.
- Feature importance via SHAP, not vibes.
- Reproducible scraping + training pipeline.

**What was hard.** Football is noisy. Half the variance in a season is
referees, injuries, and the schedule, none of which my features captured. The
honest move was to pick a model just complex enough to learn the signal that
was there, not so complex that it learned the noise. SHAP made it obvious
when I'd over-fit and which features were carrying the load.

**Lesson:** cleaner features beat fancier models.

Repo: https://github.com/nickklos10/SerieA_Machine_Learning_Predictions_2025
