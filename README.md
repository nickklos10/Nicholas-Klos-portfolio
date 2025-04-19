# Nicholas Klos - Portfolio Website

A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. This website showcases my projects, experience, and skills as a developer.

## Live Demo

[Live Portfolio Website](https://nicholas-klos-portfolio.vercel.app/)

## Features

- **Responsive Design**: Fully responsive on mobile, tablet, and desktop devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Interactive Elements**: Hover effects, animations, and transitions for engaging user experience

### Pages

- **Home**: Introduction with animated text and call-to-action buttons
- **About**: Personal bio, skills, and background information
- **Projects**: Showcase of recent development projects with descriptions and links
- **Experience**: Work history, education, and certifications with interactive components
- **Contact**: Interactive contact cards for LinkedIn, Email, and X (Twitter)

## Tech Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) (React framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth animations
- **Icons**: [Lucide Icons](https://lucide.dev/) for minimalist icons
- **Font**: System fonts optimized with next/font

## Project Structure

```
portfolio/
├── public/             # Static assets (images, icons)
│   ├── icons/          # Technology and skill icons
│   └── logos/          # Company logos for experience section
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── about/      # About page components
│   │   ├── contact/    # Contact page components
│   │   ├── experience/ # Experience page components
│   │   ├── projects/   # Projects page components
│   │   └── globals.css # Global styles
│   └── components/     # Reusable components
│       ├── Navbar.tsx  # Navigation component
│       └── ...         # Other shared components
├── tailwind.config.js  # Tailwind CSS configuration
└── next.config.js      # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/nickklos10/Nicholas-Klos-portfolio.git
   cd Nicholas-Klos-portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the site in your browser.

## Customization

### Adding Projects

Edit the `projects` array in `src/app/projects/page.tsx` to add your own projects:

```tsx
const projects = [
  {
    id: 1,
    title: "Your Project Title",
    description: "Project description goes here",
    tags: ["Next.js", "React", "TypeScript"],
    imageUrl: "/your-project-image.jpg",
    githubUrl: "https://github.com/yourusername/project-repo",
    liveUrl: "https://project-demo.com",
  },
  // Add more projects...
];
```

### Updating Experience

Modify the `experiences` array in `src/app/experience/page.tsx` with your work history.

### Adding Skills

Update the `skillCategories` array in `src/app/experience/page.tsx` to showcase your technical skills.

## Deployment

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Vercel will automatically detect Next.js and configure the build settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
