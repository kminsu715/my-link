import React from 'react';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center space-y-8 w-full animate-fade-in-up mt-8">
      {/* Avatar Container */}
      <div className="relative group perspective-1000">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full opacity-60 blur-lg group-hover:opacity-100 transition duration-700 animate-spin-slow"></div>
        <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full opacity-40 blur-xl group-hover:opacity-80 transition duration-700"></div>
        <div className="relative flex items-center justify-center w-36 h-36 rounded-full overflow-hidden border-[3px] border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/80 backdrop-blur-3xl shadow-2xl transition-transform duration-700 group-hover:scale-105 z-10">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 to-zinc-400 dark:from-white dark:to-zinc-500">
            YC
          </span>
        </div>
      </div>
      
      {/* Title & Description */}
      <div className="space-y-5 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 drop-shadow-sm">
          윤창식
        </h1>
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30">
          <p className="text-sm md:text-base bg-[length:200%_auto] animate-gradient-x text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 font-bold tracking-[0.2em] uppercase">
            AI-Native Software Engineer
          </p>
        </div>
        <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-medium max-w-xl mx-auto leading-relaxed mt-2">
          사용자 경험과 시스템 효율성을 모두 고민하는 엔지니어입니다. <br/>
          복잡한 문제를 단순화하고 <strong className="text-zinc-900 dark:text-zinc-100 font-bold">AI 에이전트 파이프라인</strong>을 통해 개발 워크플로우를 혁신합니다.
        </p>
      </div>
    </section>
  );
}
