import React from 'react';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center space-y-6 w-full animate-fade-in-up">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-xl transition-transform duration-500 group-hover:scale-105">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-400">
            YC
          </span>
        </div>
      </div>
      
      <div className="space-y-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm">
          윤창식
        </h1>
        <p className="text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 font-bold tracking-widest uppercase">
          AI-Native Software Engineer
        </p>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
          사용자 경험과 시스템 효율성을 모두 고민하는 엔지니어입니다. 
          복잡한 문제를 단순화하고 <strong className="text-zinc-800 dark:text-zinc-200">AI 에이전트 파이프라인</strong>을 통해 개발 워크플로우를 혁신합니다.
        </p>
      </div>
    </section>
  );
}
