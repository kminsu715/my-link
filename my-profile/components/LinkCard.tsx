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
      className="group relative flex items-center justify-between w-full max-w-2xl p-6 mb-6 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all duration-150"
    >
      <div className="flex items-center space-x-6 z-10 w-full group-hover:bg-[#FFF000] dark:group-hover:bg-[#FF0055] transition-colors duration-150 absolute inset-0 -z-10"></div>
      
      <div className="relative flex items-center space-x-6 z-10">
        {icon && (
          <div className="flex items-center justify-center p-3 border-4 border-black dark:border-white bg-[#FFB800] dark:bg-[#00D0FF] text-black transition-colors duration-150">
            {icon}
          </div>
        )}
        <span className="text-2xl font-black uppercase text-black dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors duration-150">
          {label}
        </span>
      </div>
      
      <div className="relative z-10 text-black dark:text-white transform transition-transform duration-150 group-hover:translate-x-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </a>
  );
}
