import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 px-4">
      <nav className="flex items-center space-x-8 px-8 py-3 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg border border-white/50 dark:border-zinc-800/50 shadow-sm transition-all duration-300 hover:shadow-md">
        <a href="#about" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
          About
        </a>
        <a href="#projects" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
          Projects
        </a>
        <a href="#contact" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
          Contact
        </a>
      </nav>
    </header>
  );
}
