import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 px-4 animate-fade-in-up">
      <nav className="flex items-center space-x-6 sm:space-x-8 px-8 py-3.5 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:border-white/20">
        <a href="#about" className="text-sm font-medium tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
          About
        </a>
        <a href="#projects" className="text-sm font-medium tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
          Projects
        </a>
        <a href="#contact" className="text-sm font-medium tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white dark:hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
          Contact
        </a>
      </nav>
    </header>
  );
}
