# GEMINI.md - Project Context

This document provides essential context and instructions for AI agents working on the `my-link` workspace, primarily centered around the `my-profile` project.

## Project Overview: `my-profile`

`my-profile` is a modern web application built with **Next.js 16** and **React 19**. It utilizes the **App Router** for its architectural structure and is styled with **Tailwind CSS 4.0**.

### Key Technologies
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Fonts:** [Geist](https://vercel.com/font) (Sans and Mono variants)

## Project Structure

- `my-profile/app/`: Contains the core application logic, routes, and layout.
  - `layout.tsx`: Root layout with font configuration and global styles.
  - `page.tsx`: The main landing page.
  - `globals.css`: Global CSS and Tailwind directives.
- `my-profile/public/`: Static assets such as images and icons.
- `my-profile/package.json`: Project dependencies and scripts.

## Building and Running

Commands should be executed within the `my-profile` directory:

- **Development Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Start Production Server:** `npm run start`
- **Linting:** `npm run lint`

## Development Conventions

### Coding Style
- **Components:** Use functional components with TypeScript interfaces for props.
- **Styling:** Prefer utility-first styling with Tailwind CSS. Follow the existing patterns in `my-profile/app/page.tsx`.
- **Fonts:** Use the defined CSS variables (`--font-geist-sans`, `--font-geist-mono`) for typography.

### Best Practices
- **Accessibility:** Ensure proper semantic HTML and ARIA attributes where necessary.
- **Performance:** Utilize Next.js optimizations like `next/image` and `next/font`.
- **Types:** Maintain strict type safety across the application.
