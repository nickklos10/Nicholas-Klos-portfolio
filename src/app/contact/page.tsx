"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Contact() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Handle both hover and touch events
  const handleCardInteraction = (cardId: string, isEntering: boolean) => {
    setHoveredCard(isEntering ? cardId : null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-0 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-5xl font-bold text-center text-purple-500 mb-2">
          CONTACT ME
        </h1>
        <p className="text-base md:text-lg text-center mb-4 md:mb-6">
          Let's connect and create something amazing together.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-2 md:mt-4">
          {/* LinkedIn Card */}
          <div
            className={`bg-black border border-gray-800 rounded-3xl p-4 md:p-6 flex flex-col transition-all duration-500 h-[40vh] md:h-[60vh] max-h-[500px] ${
              hoveredCard === "linkedin" ? "transform -rotate-6 scale-105" : ""
            }`}
            onMouseEnter={() => handleCardInteraction("linkedin", true)}
            onMouseLeave={() => handleCardInteraction("linkedin", false)}
            onTouchStart={() => handleCardInteraction("linkedin", true)}
            onTouchEnd={() =>
              setTimeout(() => handleCardInteraction("linkedin", false), 3000)
            }
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg md:text-xl font-bold text-white">
                LinkedIn
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white md:w-5 md:h-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </div>
            <p className="text-sm md:text-base text-gray-400 mb-2 md:mb-4">
              Connect with me on LinkedIn
            </p>
            <div className="relative flex-grow w-full overflow-hidden rounded-lg group">
              <Image
                src="/in_profile.jpg"
                alt="LinkedIn Profile Preview"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
                className="rounded-lg transition-all duration-500"
              />
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-500 ${
                  hoveredCard === "linkedin" ? "opacity-100" : "opacity-0"
                }`}
              >
                <a
                  href="https://www.linkedin.com/in/nicholas-klos-16438422b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-base md:text-lg hover:text-purple-400 transition-colors font-medium px-4 text-center"
                >
                  linkedin.com/in/nicholas-klos
                </a>
              </div>
            </div>
          </div>

          {/* Gmail Card */}
          <div
            className={`bg-black border border-gray-800 rounded-3xl p-4 md:p-6 flex flex-col transition-all duration-500 h-[40vh] md:h-[60vh] max-h-[500px] ${
              hoveredCard === "gmail" ? "transform rotate-6 scale-105" : ""
            }`}
            onMouseEnter={() => handleCardInteraction("gmail", true)}
            onMouseLeave={() => handleCardInteraction("gmail", false)}
            onTouchStart={() => handleCardInteraction("gmail", true)}
            onTouchEnd={() =>
              setTimeout(() => handleCardInteraction("gmail", false), 3000)
            }
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg md:text-xl font-bold text-white">Gmail</h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white md:w-5 md:h-5"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <p className="text-sm md:text-base text-gray-400 mb-2 md:mb-4">
              Reach out to me via email
            </p>
            <div className="relative flex-grow w-full overflow-hidden rounded-lg group">
              <Image
                src="/intro_inbox_gmail2.jpg"
                alt="Gmail Interface Preview"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
                className="rounded-lg transition-all duration-500"
              />
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-500 ${
                  hoveredCard === "gmail" ? "opacity-100" : "opacity-0"
                }`}
              >
                <a
                  href="mailto:nicholask39@gmail.com"
                  className="text-white text-base md:text-lg hover:text-purple-400 transition-colors font-medium px-4 text-center"
                >
                  nicholask39@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* X Card */}
          <div
            className={`bg-black border border-gray-800 rounded-3xl p-4 md:p-6 flex flex-col transition-all duration-500 h-[40vh] md:h-[60vh] max-h-[500px] ${
              hoveredCard === "twitter" ? "transform -rotate-6 scale-105" : ""
            }`}
            onMouseEnter={() => handleCardInteraction("twitter", true)}
            onMouseLeave={() => handleCardInteraction("twitter", false)}
            onTouchStart={() => handleCardInteraction("twitter", true)}
            onTouchEnd={() =>
              setTimeout(() => handleCardInteraction("twitter", false), 3000)
            }
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg md:text-xl font-bold text-white">X</h2>
              <svg
                className="w-5 h-5 text-white w-4 h-4 md:w-5 md:h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </div>
            <p className="text-sm md:text-base text-gray-400 mb-2 md:mb-4">
              Follow me on X
            </p>
            <div className="relative flex-grow w-full overflow-hidden rounded-lg group">
              <Image
                src="/x_profile.jpg"
                alt="X Profile Preview"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
                className="rounded-lg transition-all duration-500"
              />
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-500 ${
                  hoveredCard === "twitter" ? "opacity-100" : "opacity-0"
                }`}
              >
                <a
                  href="https://x.com/klos_nicholas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-base md:text-lg hover:text-purple-400 transition-colors font-medium px-4 text-center"
                >
                  x.com/klos_nicholas
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
