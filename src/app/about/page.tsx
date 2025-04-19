"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./about.module.css";

export default function About() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className="min-h-screen flex flex-col items-center relative px-4 sm:px-6 pt-6 sm:pt-12 overflow-hidden">
      {/* Overlapping Titles - moderate spacing */}
      <div className="w-full text-center mb-16 sm:mb-24 md:mb-32 mt-8 sm:mt-16 relative">
        <h1 className="text-[12vw] font-bold text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          ABOUT ME
        </h1>
        <h2 className="text-xl sm:text-2xl text-white/90 tracking-widest relative z-10">
          ABOUT ME
        </h2>
      </div>

      {/* Main content container - moderate spacing */}
      <div className={`max-w-6xl w-full ${styles.animateFadeIn}`}>
        <div className="flex flex-col items-start gap-6 sm:gap-10 mb-10 sm:mb-16">
          <div className="flex-1 space-y-6 sm:space-y-10 w-full">
            <div className={styles.animateSlideFromRight}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl mb-3">
                Hi there again! Still{" "}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
                  NICHOLAS
                </span>
              </h1>
            </div>

            <div
              className={`space-y-4 sm:space-y-7 ${styles.animateSlideFromRight} ${styles.animationDelay100}`}
            >
              <p className="text-white/90 text-base sm:text-lg">
                I graduated with a Bachelor of Science in Computer Science from
                the University of Central Florida. With a foundation in AI/ML,
                data science, and full‑stack development, I build scalable,
                data‑driven applications and predictive models that solve
                real‑world problems.
              </p>
              <p className="text-white/90 text-base sm:text-lg">
                With experience in solar energy data science optimizing panel
                efficiency and financial data engineering at PwC, I focus on
                production‑ready solutions using Python, SQL, Flask, Next.js,
                TensorFlow, and Palantir Foundry.
              </p>
            </div>

            <div className="w-full flex justify-center mt-8 sm:mt-12">
              {isMounted && <TechIcons />}
            </div>
          </div>
        </div>

        <div
          className={`${styles.animateSlideFromBottom} ${styles.animationDelay300} mb-10 sm:mb-12`}
        >
          <p className="text-white/90 text-base sm:text-lg">
            Currently exploring full‑time roles in AI, data science, and MLOps
            as I graduate in Spring 2025. I thrive on complex challenges and
            love growing technically and creatively.
          </p>
        </div>
      </div>
    </div>
  );
}

function TechIcons() {
  const icons = [
    "/icons/icons8-python-48.png",
    "/icons/icons8-tensorflow-48.png",
    "/icons/Next.js.png",
    "/icons/scikit-learn.png",
    "/icons/docker.png",
    "/icons/icons8-aws-64.png",
    "/icons/icons8-react.svg",
    "/icons/palantir.svg",
  ];

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Once everything's painted, measure & inject perfect keyframes
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // wait until all <img> inside have loaded
    const imgs = Array.from(wrapper.querySelectorAll("img"));
    Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = () => res(null);
              img.onerror = () => res(null);
            })
      )
    ).then(() => {
      // measure full width and take half (duplicate sets)
      const fullWidth = wrapper.scrollWidth;
      const half = Math.round(fullWidth / 2);

      // inject a scroll keyframe that exactly matches our half-width
      const styleTag = document.createElement("style");
      styleTag.innerHTML = `
        @keyframes scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-${half}px, 0, 0); }
        }
      `;
      document.head.appendChild(styleTag);

      // restart the animation so the browser picks up the new keyframes
      wrapper.style.animation = "none";
      // force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      wrapper.offsetHeight;
      wrapper.style.animation = "scroll 20s linear infinite";
    });
  }, []);

  return (
    <div className={styles.techIconsContainer}>
      <div ref={wrapperRef} className={styles.techIconsWrapper}>
        {[...icons, ...icons].map((src, i) => (
          <div key={i} className={styles.techIconWrapper}>
            <Image
              src={src}
              alt={src.split("/").pop()?.replace(".svg", "") || "icon"}
              width={28}
              height={28}
              className={`${styles.techIcon} w-7 h-7 sm:w-8 sm:h-8`}
              priority
            />
          </div>
        ))}
      </div>
    </div>
  );
}
