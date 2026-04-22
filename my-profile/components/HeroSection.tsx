import React from 'react';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center space-y-10 w-full mt-10 md:mt-16 pb-10 border-b-4 border-black dark:border-white">
      
      {/* Title & Description in Brutalist Blocks */}
      <div className="w-full flex flex-col items-center gap-6">
        
        {/* Name Block */}
        <div className="bg-[#FF4500] dark:bg-[#00FF00] border-4 border-black dark:border-white px-8 py-6 md:px-16 md:py-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] rotate-[-2deg] transform transition-transform hover:rotate-0 duration-200 z-10 w-full max-w-3xl text-center">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-black dark:text-black">
            윤창식
          </h1>
        </div>

        {/* Role Badge inside a bold container */}
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white px-6 py-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rotate-[1deg] z-20 -mt-6">
          <p className="text-lg md:text-2xl font-black text-black dark:text-white uppercase tracking-widest">
            AI-Native Software Engineer
          </p>
        </div>
        
        <div className="max-w-2xl bg-cyan-300 dark:bg-[#8A2BE2] border-4 border-black dark:border-white p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] mt-8">
          <p className="text-xl md:text-2xl text-black dark:text-white font-bold leading-tight">
            사용자 경험과 시스템 효율성을 고민하는 엔지니어입니다. <br/><br/>
            복잡한 문제를 단순화하고 <span className="bg-white dark:bg-black text-black dark:text-white px-2 py-1 border-2 border-black dark:border-white mx-1 my-1 inline-block uppercase">AI 에이전트 파이프라인</span>을 통해 개발 워크플로우를 파괴적으로 혁신합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
