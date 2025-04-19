import type { Metadata } from "next";
import { Inter, Montserrat, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Welcome to my personal portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-auto">
      <head>
        <meta charSet="utf-8" />
        {/* Other head elements like title and meta description are handled by Next.js Metadata API */}
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} ${roboto_mono.variable} antialiased min-h-screen bg-background text-foreground h-full overflow-auto`}
      >
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full h-full overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
