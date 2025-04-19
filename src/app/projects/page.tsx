"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GithubIcon, ExternalLink } from "lucide-react";

// Sample project data (you would typically fetch this from an API or CMS)
const projects = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
    title: "Portfolio Website",
    description:
      "A personal portfolio website showcasing my projects and skills. Built with Next.js and Tailwind CSS.",
    tags: ["Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"],
    imageUrl: "/portfolio.jpg",
    githubUrl: "https://github.com/username/portfolio-website",
    liveUrl: "https://portfolio-demo.vercel.app",
  },
  {
    id: 5,
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
    id: 6,
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">My Projects</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center mb-12">
        Here are some of the projects I've worked on. Each project represents a
        unique challenge and showcases different skills and technologies.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{
              y: -10,
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
                  <GithubIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
