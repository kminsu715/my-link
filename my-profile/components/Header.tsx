import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 px-4">
      <nav className="flex items-center space-x-6 sm:space-x-8 px-8 py-3 bg-[#FFE700] border-4 border-black dark:bg-[#FF0055] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
        <a href="#about" className="text-base sm:text-lg font-black uppercase text-black hover:text-white hover:bg-black dark:text-white dark:hover:text-black dark:hover:bg-white px-2 py-1 transition-all duration-200">
          About
        </a>
        <a href="#projects" className="text-base sm:text-lg font-black uppercase text-black hover:text-white hover:bg-black dark:text-white dark:hover:text-black dark:hover:bg-white px-2 py-1 transition-all duration-200">
          Projects
        </a>
        <a href="#contact" className="text-base sm:text-lg font-black uppercase text-black hover:text-white hover:bg-black dark:text-white dark:hover:text-black dark:hover:bg-white px-2 py-1 transition-all duration-200">
          Contact
        </a>
      </nav>
    </header>
  );
}
