export type CaseStudy = {
  id: string;
  title: string;
  tag: string;
  mark: "grid" | "wave" | "spark";
  summary: string;
  stack: string[];
  outcomes: string[];
  lesson: string;
  links?: { github?: string; live?: string };
};

export type ExperienceEntry = {
  org: string;
  role: string;
  period: string;
  blurb: string;
};

export const ABOUT = {
  name: "Nicholas Klos",
  role: "Chief of Staff & Forward Deployed Engineer",
  industry: "private equity & ops",
  location: "—",
  email: "nicholask39@gmail.com",
  linkedin: "https://www.linkedin.com/in/nicholas-klos-16438422b/",
  twitter: "https://x.com/klos_nicholas",
  github: "https://github.com/nickklos10",
  resumeUrl: "/Nicholas_Klos_pro_resume.pdf",
  currently:
    "Chief of Staff at LifeSpeak (Minneapolis) — running governance and Board reporting for 8 PMO initiatives. Concurrently Forward Deployed Engineer at Incepta Analytics, shipping Foundry-native LLM agents and PySpark pipelines for a New Private Equity client.",
  voice: [
    "I write the way I talk: plain, specific, a bit dry. I prefer concrete examples over abstractions.",
    "I am suspicious of jargon and of any claim without a number attached.",
    "I think most 'AI products' are still UI problems wearing a model costume — I like working on the ones that aren't.",
    "I'd rather ship a small useful thing than describe a big ambitious one.",
    "I'm a researcher by training and an engineer by trade; I get genuinely excited about a clean evaluation harness.",
  ],
  summary:
    "Chief of Staff at LifeSpeak and Forward Deployed Engineer at Incepta Analytics on the New Private Equity account. Computer science background — previously ML research at the Florida Solar Energy Center and a data engineering internship at PwC Milan.",
  experience: [
    {
      org: "LifeSpeak",
      role: "Chief of Staff",
      period: "2025 — Present",
      blurb:
        "Strategic planning workshops across 8 PMO initiatives ($1M+ planned investments). Built a Foundry+Excel governance framework that pulled on-time delivery from 70% to 92%, and codified 15 metrics in a live Board Reporting app.",
    },
    {
      org: "Incepta Analytics — New Private Equity",
      role: "Forward Deployed Engineer",
      period: "2023 — Present",
      blurb:
        "Foundry Transforms + Pipeline Builder for CRM/engagement data (errors -50%, runtime -30%). Prototyped PyTorch churn models and fine-tuned LLMs. Designed AI Agents that cut executive prep cycles by 80%.",
    },
    {
      org: "Florida Solar Energy Center",
      role: "Research Assistant — ML Engineer",
      period: "Oct 2022 — Jul 2023",
      blurb:
        "AWS pipeline (Glue/EMR/S3/Lambda) ingesting 500GB/week. Time-series forecasting incl. Temporal Fusion Transformer. Boosted prediction accuracy ~25%; deployed to AWS SageMaker.",
    },
    {
      org: "PwC",
      role: "Data Engineer Intern · ML Ops & AI Ops",
      period: "Summer 2022",
      blurb:
        "Multi-terabyte banking pipelines in Palantir Foundry. PySpark optimization cut deep-learning model training time 10%+ and lifted flow efficiency 15%.",
    },
  ] satisfies ExperienceEntry[],
  skills: [
    "Python",
    "TypeScript",
    "SQL",
    "PyTorch",
    "Spark",
    "Palantir Foundry",
    "Data pipelines",
    "LLM evaluation",
    "Retrieval",
    "Forecasting",
    "AWS",
    "Docker",
  ],
  caseStudies: [
    {
      id: "f1gpt",
      title: "F1GPT",
      tag: "Personal · 2024",
      mark: "spark",
      summary:
        "A specialised Formula 1 chat application with retrieval-augmented generation over scraped season + driver data. Asks like 'who's leading constructors' standings?' work end-to-end.",
      stack: ["Next.js", "OpenAI", "LangChain", "RAG", "TypeScript"],
      outcomes: [
        "End-to-end RAG over scraped F1 corpus",
        "Streaming chat UI with cited sources",
        "Deployed and live on Vercel",
      ],
      lesson: "Most of the work in a RAG app is the retrieval, not the model.",
      links: {
        github: "https://github.com/nickklos10/f1-chat",
        live: "https://f1-chat-lilac.vercel.app/",
      },
    },
    {
      id: "serie-a",
      title: "Serie A Standings Prediction",
      tag: "ML · 2024",
      mark: "wave",
      summary:
        "Scraped historical match data, engineered features, and trained models to predict the 2024–2025 Serie A standings. Used SHAP to interrogate which features actually drove the predictions.",
      stack: ["Keras", "TensorFlow", "scikit-learn", "Pandas", "SHAP", "BeautifulSoup"],
      outcomes: [
        "Beat naive 'last-season' baseline on a held-out split",
        "Feature importance via SHAP, not vibes",
        "Reproducible scraping + training pipeline",
      ],
      lesson: "Cleaner features beat fancier models.",
      links: {
        github:
          "https://github.com/nickklos10/SerieA_Machine_Learning_Predictions_2025",
      },
    },
    {
      id: "concrete-crack",
      title: "Concrete Crack Detector",
      tag: "Computer Vision · 2024",
      mark: "grid",
      summary:
        "Full-stack CV app — a fine-tuned vision model behind a FastAPI service, dockerised, deployed to AWS, with a Next.js front-end for upload + classification.",
      stack: ["PyTorch", "torchvision", "FastAPI", "Docker", "AWS", "Next.js"],
      outcomes: [
        "Trained + served a binary crack classifier",
        "Containerised and deployed to AWS",
        "Front-end upload/inference flow",
      ],
      lesson: "The deploy is half the project.",
      links: {
        github: "https://github.com/nickklos10/Concrete-Crack-Detector-CV",
      },
    },
    {
      id: "sql-warehouse",
      title: "SQL Data Warehouse",
      tag: "Data Engineering · 2025",
      mark: "spark",
      summary:
        "A medallion-architecture warehouse on PostgreSQL — bronze ingest → silver cleansed → gold marts — with reproducible ETL and BI-ready models.",
      stack: ["PostgreSQL", "SQL", "ETL", "Data Modeling"],
      outcomes: [
        "Bronze / silver / gold layers with clear contracts",
        "Idempotent ETL — re-runs are safe",
        "BI-ready marts for analytics queries",
      ],
      lesson: "If the layers aren't clean, the dashboards lie.",
      links: { github: "https://github.com/nickklos10/sql-data-warehouse" },
    },
    {
      id: "finsight-backend",
      title: "Finsight — Finance Tracker Backend",
      tag: "Backend · 2025",
      mark: "grid",
      summary:
        "A Spring Boot REST API for personal finance tracking. Auth0-protected endpoints, PostgreSQL persistence, dockerised for local dev.",
      stack: ["Spring Boot", "Java", "PostgreSQL", "Auth0", "Docker"],
      outcomes: [
        "Auth0-protected REST endpoints",
        "PostgreSQL schema with migrations",
        "Dockerised local dev parity",
      ],
      lesson: "Auth done right at the start saves weeks later.",
      links: { github: "https://github.com/nickklos10/Finance-Tracker-backend" },
    },
    {
      id: "fashion-cnn",
      title: "Fashion-MNIST CNN",
      tag: "Deep Learning · 2024",
      mark: "wave",
      summary:
        "A CNN classifier over Fashion-MNIST, written from scratch in PyTorch. The kind of project where you actually feel the loss curve in your bones.",
      stack: ["PyTorch", "torchvision", "matplotlib"],
      outcomes: [
        "Custom CNN architecture, no off-the-shelf wrapper",
        "Reproducible training + evaluation",
        "Loss + accuracy curves committed to the repo",
      ],
      lesson: "Train one from scratch before you reach for the framework.",
      links: {
        github: "https://github.com/nickklos10/fashion-mnist-cnn-classifier",
      },
    },
  ] satisfies CaseStudy[],
};

export type AboutType = typeof ABOUT;
