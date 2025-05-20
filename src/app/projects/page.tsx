"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Custom GitHub icon component
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

// Sample project data (you would typically fetch this from an API or CMS)
const projects = [
  {
    id: 1,
    title: "F1GPT",
    description:
      "A specialized Formula 1 racing chat application built with Next.js, React, and Tailwind CSS. This project uses Retrieval Augmented Generation and Langchain.",
    tags: [
      "OpenAI",
      "RAG",
      "Langchain",
      "Web Scraping",
      "Next.js",
      "React",
      "Tailwind CSS",
      "API Integration",
      "TypeScript",
    ],
    imageUrl: "/f1-gpt.jpg",
    githubUrl: "https://github.com/nickklos10/f1-chat",
    liveUrl: "https://f1-chat-lilac.vercel.app/",
  },
  {
    id: 2,
    title: "Serie A Standings Prediction",
    description:
      "ML project involving scraping data, processing the data, and building machine learning models to predict the standings for the 2024-2025 Serie A season.",
    tags: [
      "Machine Learning",
      "Jupiter Notebook",
      "Keras",
      "Pandas",
      "SHAP",
      "beautiful-soup",
      "Tensorflow",
      "matplotlib",
      "scikit-learn",
    ],
    imageUrl: "/serie-a.jpg",
    githubUrl:
      "https://github.com/nickklos10/SerieA_Machine_Learning_Predictions_2025",
    liveUrl: "https://e-commerce-demo.vercel.app",
  },
  {
    id: 3,
    title: "Concrete Crack Detector",
    description:
      "A web application for detecting cracks in concrete surfaces using a deep learning model integrated with Flask.",
    tags: [
      "Machine Learning",
      "Jupiter Notebook",
      "Pytorch",
      "torchvision",
      "flask",
      "axios",
      "jinja2",
      "matplotlib",
      "html-css-javascript",
    ],
    imageUrl: "/concretecrack.jpg",
    githubUrl: "https://github.com/nickklos10/Concrete-Crack-Detector-CV",
    liveUrl: "https://task-app-demo.vercel.app",
  },
  {
    id: 4,
    title: "3-tier distributed Enterprise system",
    description:
      "A servlet/JSP-based multi-tiered enterprise application using a Tomcat container that allows clients, accountants and root-level users to execute SQL queries and updates with specific business logic implementation.",
    tags: [
      "MySQL",
      "Java",
      "JDBC",
      "JSP-servlet",
      "Apache Tomcat",
      "ajax",
      "java-ee",
      "html-css-javascript",
    ],
    imageUrl: "/p4.jpg",
    githubUrl:
      "https://github.com/nickklos10/Three-Tier-Distributed-Web-Application",
    liveUrl: "https://weather-dashboard-demo.vercel.app",
  },
  {
    id: 5,
    title: "Portfolio Website",
    description:
      "A personal portfolio website showcasing my projects and skills. Built with Next.js and Tailwind CSS.",
    tags: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
    imageUrl: "/portfolio.jpg",
    githubUrl: "https://github.com/username/portfolio-website",
    liveUrl: "https://portfolio-demo.vercel.app",
  },
  {
    id: 6,
    title: "Fashion CNN Classifier",
    description:
      "A convolutional neural network (CNN) designed to classify images from the Fashion-MNIST dataset.",
    tags: [
      "Python",
      "PyTorch",
      "torchvision",
      "matplotlib",
      "CNN",
      "Deep Learning",
    ],
    imageUrl: "/fashionmnist.jpg",
    githubUrl: "https://github.com/nickklos10/fashion-mnist-cnn-classifier",
    liveUrl: "https://recipe-demo.vercel.app",
  },
  {
    id: 7,
    title: "Banking System Simulation",
    description:
      "A multithreaded banking system simulation designed to handle concurrent banking operations.",
    tags: ["Java", "Multithreading", "Concurrency", "OOP"],
    imageUrl: "/banking.jpg",
    githubUrl: "https://github.com/nickklos10/BankAccount-Simulation",
    liveUrl: "https://fitness-app-demo.vercel.app",
  },
];

export default function Projects() {
  return (
    <div className="container mx-auto px-4 py-12 pt-24 md:pt-28">
      <h1 className="text-4xl font-bold mb-8 text-center">My Projects</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center mb-12">
        Here are some of the projects I&apos;ve worked on. Each project
        represents a unique challenge and showcases different skills and
        technologies.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group"
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative flex items-center justify-center overflow-hidden">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <span className="text-gray-500 dark:text-gray-400 z-0">
                  Project Image
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  <GitHubIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
