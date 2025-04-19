"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

export default function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 md:py-8 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-5xl font-bold text-center text-purple-500 mb-4">
          CONTACT ME
        </h1>
        <p className="text-base md:text-lg text-center mb-8 md:mb-10">
          Let's connect and create something amazing together.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* LinkedIn Card */}
          <div className="relative">
            <StyledContactCard>
              <div className="flex justify-between items-center mb-3">
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
              <p className="text-sm md:text-base text-gray-300 mb-4">
                Connect with me on LinkedIn
              </p>
              <div className="relative flex-grow w-full overflow-hidden rounded-lg">
                <Image
                  src="/in_profile.jpg"
                  alt="LinkedIn Profile Preview"
                  width={500}
                  height={350}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                  className="aspect-[4/3]"
                />
              </div>
              <a
                href="https://www.linkedin.com/in/nicholas-klos-16438422b/"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button bg-blue-600 mt-4"
              >
                <span>CONNECT</span>
                <span className="icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </span>
              </a>
            </StyledContactCard>
          </div>

          {/* Gmail Card */}
          <div className="relative">
            <StyledContactCard>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Gmail
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <p className="text-sm md:text-base text-gray-300 mb-4">
                Reach out to me via email
              </p>
              <div className="relative flex-grow w-full overflow-hidden rounded-lg">
                <Image
                  src="/intro_inbox_gmail2.jpg"
                  alt="Gmail Interface Preview"
                  width={500}
                  height={350}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                  className="aspect-[4/3]"
                />
              </div>
              <a
                href="mailto:nicholask39@gmail.com"
                className="cta-button bg-purple-600 mt-4"
              >
                <span>EMAIL ME</span>
                <span className="icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </span>
              </a>
            </StyledContactCard>
          </div>

          {/* X Card */}
          <div className="relative">
            <StyledContactCard>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg md:text-xl font-bold text-white">X</h2>
                <svg
                  className="w-5 h-5 text-white w-4 h-4 md:w-5 md:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </div>
              <p className="text-sm md:text-base text-gray-300 mb-4">
                Follow me on X
              </p>
              <div className="relative flex-grow w-full overflow-hidden rounded-lg">
                <Image
                  src="/x_profile.jpg"
                  alt="X Profile Preview"
                  width={500}
                  height={350}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                  className="aspect-[4/3]"
                />
              </div>
              <a
                href="https://x.com/klos_nicholas"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button bg-blue-600 mt-4"
              >
                <span>FOLLOW</span>
                <span className="icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </span>
              </a>
            </StyledContactCard>
          </div>
        </div>
      </div>
    </div>
  );
}

const StyledContactCard = styled.div`
  display: flex;
  flex-direction: column;
  background: rgb(0, 0, 0);
  border: 1px solid #1f2937;
  border-radius: 1rem;
  padding: 1.25rem;
  height: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
  }

  .cta-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 0.375rem;
    transition: all 0.3s;
    box-shadow: 5px 5px 0 black;
    transform: skewX(-10deg);
    text-decoration: none;

    @media (max-width: 768px) {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    span {
      transform: skewX(10deg);
      display: block;
    }

    .icon {
      margin-left: 0.75rem;
      display: flex;
      align-items: center;
      transform: translateX(0) skewX(10deg);
      transition: transform 0.3s;
    }

    &:hover {
      box-shadow: 8px 8px 0 #fbc638;

      .icon {
        transform: translateX(5px) skewX(10deg);
      }
    }
  }
`;
