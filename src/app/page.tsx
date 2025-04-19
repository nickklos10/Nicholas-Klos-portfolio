"use client";

import Image from "next/image";
import Link from "next/link";
import TypeAnimation from "@/components/TypeAnimation";
import AnimatedButton from "@/components/AnimatedButton";

export default function Home() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col justify-center relative">
      {/* Hero Section */}
      <section className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-center h-full gap-6 md:gap-8">
        <div className="md:w-1/2 max-w-2xl md:max-h-[80vh] flex flex-col">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 font-heading text-white">
            👋🏻 Hi, It's <span className="text-blue-600">NICHOLAS KLOS</span>
          </h1>

          {/* Typing animation */}
          <div className="h-14 mb-3 font-heading">
            <TypeAnimation />
          </div>

          <p className="text-base md:text-lg text-white mb-5 line-clamp-4 md:line-clamp-none">
            I'm a passionate and dedicated graduate software engineer with a
            strong focus on Machine Learning, Artificial Intelligence, and Data
            Analysis.
          </p>
          <div className="flex flex-wrap gap-6 mt-auto mb-4">
            <div>
              <Link href="/projects">
                <AnimatedButton text="VIEW MY WORK" color="blue" />
              </Link>
            </div>

            <div>
              <Link href="/contact">
                <AnimatedButton text="CONTACT ME" color="purple" />
              </Link>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-center">
          <div className="w-52 md:w-72 max-w-sm">
            <Image
              src="/Me_SunG.png"
              alt="Watercolor portrait of Nicholas Klos"
              width={500}
              height={600}
              priority
              className="w-full h-auto profile-image"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
