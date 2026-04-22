import React from 'react';

interface LinkCardProps {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export default function LinkCard({ label, href, icon }: LinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between w-full max-w-xl p-5 mb-4 overflow-hidden rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl border border-white/80 dark:border-zinc-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:bg-white/60 dark:hover:bg-white/5 hover:border-blue-200 dark:hover:border-blue-500/30"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative flex items-center space-x-5 z-10">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 transition-all duration-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            {icon}
          </div>
        )}
        <span className="text-lg font-bold tracking-tight text-zinc-800 dark:text-zinc-200 group-hover:text-blue-700 dark:group-hover:text-white transition-colors duration-300">
          {label}
        </span>
      </div>
      
      <div className="relative z-10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </a>
  );
}
