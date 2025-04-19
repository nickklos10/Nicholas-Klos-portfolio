"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ExternalLink, Briefcase, Award } from "lucide-react";

interface ExperienceCardProps {
  logo: string;
  company: string;
  role: string;
  timeframe: string;
  highlights: string[];
  url?: string;
}

interface CertificationProps {
  name: string;
  issuer: string;
  date: string;
  image?: string;
  url: string;
  summary?: string;
}

interface SkillProps {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  icon?: string;
}

interface SkillCategoryProps {
  title: string;
  icon: React.ReactNode;
  skills: SkillProps[];
}

export default function Experience() {
  const [activeTab, setActiveTab] = useState<"work" | "certifications">("work");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const experiences: ExperienceCardProps[] = [
    {
      logo: "/logos/University-of-Central-Florida-Logo-1536x966.png",
      company: "Florida Solar Energy Center (FSEC)",
      role: "Undergraduate Research Assistant - Data Science",
      timeframe: "2022–2023",
      highlights: [
        "Enhanced data processing capabilities by integrating statistical analysis with machine learning algorithms,resulting in a 35% reduction in processing time across 1.5 million data points.",
        "Conducted in-depth performance analyses of solar panels using predictive modeling and big data analytics, achieving a 30% increase in efficiency metrics under varying environmental conditions.",
        "Developed and deployed automated scripts for time series analysis and model optimization, streamlining workflows that handled over 500GB of data weekly while improving model accuracy by 25%.",
      ],
    },
    {
      logo: "/logos/pwc.svg",
      company: "PwC",
      role: "Data Engineering Intern – AIOps / MLOps",
      timeframe: "Summer 2022",
      highlights: [
        "Engineered advanced back-end data models within the Palantir Foundry platform, leveraging deep learning and neural networks to enhance data processing capabilities, achieving a 40% reduction in model training time across large datasets.",
        "Developed and optimized scalable data structures utilizing Spark Python API for a leading Italian bank, resulting in a 30% improvement in data flow efficiency and significantly enhancing cloud computing performance for AI applications.",
        "Implemented robust ETL pipelines to streamline data ingestion, transformation, and storage processes while maintaining high-quality standards; increased workflow efficiency by 25% and reduced error rates by 15% through meticulous database management with Oracle and Microsoft SQL Server.",
      ],
    },
  ];

  const certifications: CertificationProps[] = [
    {
      name: "AI Engineering",
      issuer: "IBM",
      date: "2024",
      image: "/logos/icons8-ibm.svg",
      url: "https://www.coursera.org/account/accomplishments/specialization/JH89W78914WG",
      summary: "Deep learning, ML pipelines, neural networks, deployment",
    },
    {
      name: "AI Developer",
      issuer: "IBM",
      date: "2024",
      image: "/logos/icons8-ibm.svg",
      url: "https://www.coursera.org/account/accomplishments/specialization/TIPAXZ6TTDOC",
      summary: "NLP, computer vision, generative AI, model optimization",
    },
    {
      name: "Python for Data Science, AI & Development",
      issuer: "IBM",
      date: "2024",
      image: "/logos/icons8-ibm.svg",
      url: "https://www.coursera.org/account/accomplishments/verify/DWGITY88WYX1",
      summary: "Data analysis, NumPy, pandas, scikit-learn",
    },
    {
      name: "Introduction to Generative AI Learning Path",
      issuer: "Google",
      date: "2024",
      image: "/logos/icons8-google.svg",
      url: "https://www.coursera.org/account/accomplishments/specialization/AHM45T2T8CUC",
      summary: "LLMs, transformers, prompt engineering, vector embeddings",
    },
    {
      name: "Databricks Fundamentals",
      issuer: "Databricks",
      date: "2025",
      image: "/logos/databricks.svg",
      url: "https://www.cncf.io/certification/cka/",
      summary: "Data lakehouse, Spark, data engineering, SQL analytics",
    },
    {
      name: "IT Fundamentals Pro",
      issuer: "TestOut",
      date: "2024",
      image: "/logos/testout.jpeg",
      url: "https://certification.testout.com/verifycert/6-1C6-VHEHBH",
      summary: "Networking, troubleshooting, security, infrastructure",
    },
  ];

  const skillCategories: SkillCategoryProps[] = [
    {
      title: "UI Frameworks & Libraries",
      icon: <CodeIcon className="w-5 h-5 text-purple-500" />,
      skills: [
        { name: "Next.js", level: "Intermediate", icon: "/icons/Next.js.png" },
        {
          name: "React.js",
          level: "Intermediate",
          icon: "/icons/icons8-react.svg",
        },
        {
          name: "TailwindCSS",
          level: "Intermediate",
          icon: "/icons/tailwind-css-svgrepo-com.svg",
        },
        {
          name: "Angular",
          level: "Intermediate",
          icon: "/icons/angular-icon-svgrepo-com.svg",
        },
      ],
    },
    {
      title: "Languages",
      icon: <BracketsIcon className="w-5 h-5 text-purple-500" />,
      skills: [
        {
          name: "Python",
          level: "Advanced",
          icon: "/icons/icons8-python-48.png",
        },
        {
          name: "JavaScript",
          level: "Intermediate",
          icon: "/icons/javascript-svgrepo-com.svg",
        },
        {
          name: "TypeScript",
          level: "Intermediate",
          icon: "/icons/typescript-svgrepo-com.svg",
        },
        {
          name: "SQL",
          level: "Advanced",
          icon: "/icons/sql-svgrepo-com.svg",
        },
        {
          name: "Java",
          level: "Intermediate",
          icon: "/icons/java-svgrepo-com.svg",
        },
        {
          name: "C++",
          level: "Intermediate",
          icon: "/icons/c.svg",
        },
      ],
    },
    {
      title: "Backend & APIs",
      icon: <ServerIcon className="w-5 h-5 text-purple-500" />,
      skills: [
        {
          name: "Django",
          level: "Advanced",
          icon: "/icons/django-svgrepo-com.svg",
        },
        {
          name: "Spring Boot",
          level: "Intermediate",
          icon: "/icons/spring-boot-svgrepo-com.svg",
        },
        {
          name: "Node.js",
          level: "Intermediate",
          icon: "/icons/nodejs-icon.svg",
        },
        {
          name: "Express",
          level: "Intermediate",
          icon: "/icons/Express.svg",
        },
        {
          name: "REST API",
          level: "Intermediate",
          icon: "/icons/rest-api-svgrepo-com.svg",
        },
      ],
    },
    {
      title: "ML & Data Science Libraries",
      icon: <TestIcon className="w-5 h-5 text-purple-500" />,
      skills: [
        {
          name: "Scikit-learn",
          level: "Advanced",
          icon: "/icons/scikit-learn.png",
        },
        {
          name: "TensorFlow",
          level: "Intermediate",
          icon: "/icons/icons8-tensorflow-48.png",
        },
        {
          name: "Pandas",
          level: "Advanced",
          icon: "/icons/pandas-svgrepo-com.svg",
        },
        {
          name: "Numpy",
          level: "Intermediate",
          icon: "/icons/numpy-svgrepo-com.svg",
        },
        {
          name: "Pytorch",
          level: "Intermediate",
          icon: "/icons/pytorch-svgrepo-com.svg",
        },
      ],
    },
    {
      title: "AI Libraries",
      icon: <DesignIcon className="w-5 h-5 text-purple-500" />,
      skills: [
        {
          name: "HuggingFace",
          level: "Intermediate",
          icon: "/icons/hugging-face-svgrepo-com.svg",
        },
        {
          name: "LangChain",
          level: "Beginner",
          icon: "/icons/Langchain--Streamline-Simple-Icons.svg",
        },
        {
          name: "LangGraph",
          level: "Beginner",
          icon: "/icons/SimpleIconsLanggraph.svg",
        },
      ],
    },
    {
      title: "Tools",
      icon: <ToolsIcon className="w-5 h-5 text-purple-500" />,
      skills: [
        { name: "Git", level: "Advanced", icon: "/icons/git-svgrepo-com.svg" },
        { name: "Docker", level: "Intermediate", icon: "/icons/docker.png" },
        {
          name: "AWS",
          level: "Intermediate",
          icon: "/icons/icons8-aws-64.png",
        },
        {
          name: "Github",
          level: "Advanced",
          icon: "/icons/github-142-svgrepo-com.svg",
        },
        {
          name: "Palantir Foundry",
          level: "Intermediate",
          icon: "/icons/palantir.svg",
        },
      ],
    },
  ];

  return (
    <div className="relative pb-24 pt-16">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">
          Experience & Skills
        </h1>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Side (Experience or Certifications) */}
          <div className="lg:col-span-2">
            {/* Toggle Button */}
            <div className="flex justify-center mb-10">
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full inline-flex shadow-md">
                <button
                  onClick={() => setActiveTab("work")}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center space-x-2 ${
                    activeTab === "work"
                      ? "bg-purple-600 text-white shadow-md scale-105 transform"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{
                      rotate: activeTab === "work" ? [0, -10, 10, -5, 5, 0] : 0,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Briefcase size={18} />
                  </motion.div>
                  <span>Work</span>
                </button>
                <button
                  onClick={() => setActiveTab("certifications")}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center space-x-2 ${
                    activeTab === "certifications"
                      ? "bg-purple-600 text-white shadow-md scale-105 transform"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{
                      rotate:
                        activeTab === "certifications"
                          ? [0, -10, 10, -5, 5, 0]
                          : 0,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Award size={18} />
                  </motion.div>
                  <span>Certifications</span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "work" ? (
                <motion.div
                  key="work"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Briefcase className="mr-2 text-purple-500" size={24} />
                    Professional Experience
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    With experience in data science and web development, I've
                    built AI-driven applications and data pipelines for
                    real-world problems across financial services and energy
                    sectors.
                  </p>

                  <div className="space-y-8">
                    {experiences.map((exp, index) => (
                      <ExperienceCard key={index} {...exp} />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="certifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Award className="mr-2 text-purple-500" size={24} />
                    Certifications
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Continuous learning is key to staying current in the
                    fast-evolving tech landscape. Here are certifications I've
                    earned to deepen my knowledge in AI, data science, and
                    development.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certifications.map((cert, index) => (
                      <CertificationCard key={index} {...cert} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side (Skills) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <CodeBracketIcon className="w-6 h-6 text-purple-500 mr-2" />
                Technical Skills
              </h2>

              <div className="space-y-4">
                {skillCategories.map((category) => (
                  <SkillCategory
                    key={category.title}
                    category={category}
                    isOpen={openCategory === category.title}
                    toggle={() => toggleCategory(category.title)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({
  logo,
  company,
  role,
  timeframe,
  highlights,
}: ExperienceCardProps) {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={logo}
            alt={`${company} logo`}
            fill
            style={{ objectFit: "contain" }}
            className="rounded-md"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{role}</h3>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {company}
            </p>
            <span className="hidden md:block text-gray-400">•</span>
            <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full w-fit">
              {timeframe}
            </span>
          </div>
        </div>
      </div>
      <ul className="space-y-2 mt-4 ml-5">
        {highlights.map((highlight, i) => (
          <li
            key={i}
            className="text-gray-600 dark:text-gray-400 flex items-start"
          >
            <span className="text-purple-500 mr-2">•</span>
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertificationCard({
  name,
  issuer,
  date,
  image,
  url,
  summary,
}: CertificationProps) {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 h-full flex flex-col transition-all duration-300 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            {image && (
              <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                <Image
                  src={image}
                  alt={`${issuer} logo`}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {issuer}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{date}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">View →</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{name}</h3>
        {summary && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {summary}
          </p>
        )}
      </div>
    </Link>
  );
}

function SkillCategory({
  category,
  isOpen,
  toggle,
}: {
  category: SkillCategoryProps;
  isOpen: boolean;
  toggle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        className="w-full p-4 flex justify-between items-center text-left"
        onClick={toggle}
      >
        <div className="flex items-center">
          {category.icon}
          <h3 className="font-medium ml-2">{category.title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`${category.title}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <div className="grid grid-cols-2 gap-3">
              {category.skills.map((skill, index) => (
                <SkillBadge
                  key={`${category.title}-${skill.name}-${index}`}
                  skill={skill}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillBadge({ skill }: { skill: SkillProps }) {
  const levelColors = {
    Beginner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Intermediate:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Advanced:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
      {skill.icon && (
        <div className="relative w-5 h-5 flex-shrink-0">
          <Image
            src={skill.icon}
            alt={`${skill.name} icon`}
            width={20}
            height={20}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{skill.name}</p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            levelColors[skill.level]
          }`}
        >
          {skill.level}
        </span>
      </div>
    </div>
  );
}

// Simple icon components
function CodeBracketIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
      />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

function BracketsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
      />
    </svg>
  );
}

function TestIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
      />
    </svg>
  );
}

function DesignIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

function ToolsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
      />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25v-10.5m15 0c.995.128 1.823.355 2.55.692 1.02.566 1.842 1.299 2.404 2.295 2.404h.45c.996 0 1.822-.723 2.296-1.72l.128-.45c.337-.724.564-1.552.692-2.548.692Z"
      />
    </svg>
  );
}
