"use client";

import Image from "next/image";
import Link from "next/link";
import TypeAnimation from "@/components/TypeAnimation";
import AnimatedButton from "@/components/AnimatedButton";
import styled from "styled-components";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative pt-6 md:pt-4 pb-16 md:pb-4">
      {/* Hero Section */}
      <section className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-center h-full gap-4 md:gap-12 pt-6 md:pt-0">
        <div className="md:w-1/2 max-w-2xl md:max-h-[80vh] flex flex-col space-y-3 md:space-y-8">
          <h1 className="text-xl md:text-5xl font-bold font-heading text-white">
            👋🏻 Hi, It's <span className="text-blue-600">NICHOLAS KLOS</span>
          </h1>

          {/* Typing animation */}
          <div className="h-10 md:h-14 font-heading">
            <TypeAnimation />
          </div>

          <p className="text-xs md:text-lg text-white line-clamp-3 md:line-clamp-none">
            I'm a passionate and dedicated graduate software engineer with a
            strong focus on Machine Learning, Artificial Intelligence, and Data
            Analysis.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-6 mt-3 md:mt-8 mb-8 md:mb-0">
            <div className="transform scale-80 md:scale-100 origin-left">
              <Link href="/projects">
                <AnimatedButton text="VIEW MY WORK" color="blue" />
              </Link>
            </div>

            <div className="transform scale-80 md:scale-100 origin-left">
              <Link href="/contact">
                <AnimatedButton text="CONTACT ME" color="purple" />
              </Link>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-center mb-2 md:mb-0">
          <StyledPortraitContainer>
            {/* Decorative elements */}
            <div className="absolute w-4 h-4 bg-yellow-400/20 rounded-full -top-2 -left-1"></div>
            <div className="absolute w-6 h-6 bg-yellow-400/20 rounded-full bottom-10 -right-2"></div>
            <div className="absolute w-3 h-3 bg-white/20 rounded-full top-10 -right-3"></div>
            <div className="absolute w-5 h-5 bg-white/20 rounded-full -bottom-2 left-10"></div>

            {/* Diagonal lines */}
            <div className="absolute h-px w-32 bg-white/30 -rotate-7 -top-4 right-10"></div>
            <div className="absolute h-px w-40 bg-white/30 rotate-7 -bottom-4 left-5"></div>

            {/* Back frame */}
            <div className="frame-back"></div>

            {/* Front frame */}
            <div className="frame-front">
              <div className="image-container">
                <Image
                  src="/Me_SunG.png"
                  alt="Watercolor portrait of Nicholas Klos"
                  width={500}
                  height={600}
                  priority
                  className="profile-image"
                />
              </div>
            </div>
          </StyledPortraitContainer>
        </div>
      </section>
    </div>
  );
}

const StyledPortraitContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;

  /* Add custom scaling for mobile */
  @media (max-width: 768px) {
    max-width: 280px;
    transform: scale(0.85);
  }

  .frame-back {
    position: absolute;
    top: -8px;
    right: -8px;
    bottom: 8px;
    left: 8px;
    border: 2px dashed #facc15;
    border-radius: 12px;
    transform: rotate(7deg);
    z-index: 0;
  }

  .frame-front {
    position: relative;
    padding: 15px;
    background: #2563eb;
    transform: rotate(7deg);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    border: 4px solid #2563eb;
    border-radius: 12px;
    z-index: 1;

    .image-container {
      transform: rotate(-7deg);
      overflow: hidden;
      width: 100%;
      height: 100%;
      border-radius: 8px;

      .profile-image {
        width: 100%;
        height: auto;
        object-fit: cover;
        display: block;
        filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.1));
      }
    }
  }
`;
