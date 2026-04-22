import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import LinkCard from "../components/LinkCard";

export default function Home() {
  const techStack = ["TypeScript", "Next.js", "React", "Tailwind CSS", "AI Agent Pipeline", "Claude Code", "Turborepo"];
  
  const links = [
    { 
      label: "Github", 
      href: "https://github.com/caesiumy",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
      )
    },
    { 
      label: "LinkedIn", 
      href: "https://www.linkedin.com/in/chang-sik-yoon",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      )
    },
    { 
      label: "Blog", 
      href: "https://caesiumy.dev",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
      )
    },
    { 
      label: "Email", 
      href: "mailto:dbs2636@gmail.com",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      )
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-grid-pattern relative">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-32 pb-24 px-4 w-full mx-auto space-y-24 z-10 max-w-[1400px]">
        
        <HeroSection />

        <div className="flex flex-col items-center w-full space-y-32">
          
          {/* Tech Stack Section */}
          <section id="about" className="w-full flex flex-col items-center space-y-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#FF0055] dark:text-[#FFAA00] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              Core Tech
            </h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
              {techStack.map((tech, i) => (
                <span 
                  key={tech} 
                  className={`px-6 py-4 text-2xl font-black text-black dark:text-white uppercase 
                    border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]
                    hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all duration-150
                    ${i % 3 === 0 ? "bg-[#FFE700] dark:bg-[#0044FF]" : i % 3 === 1 ? "bg-[#FF00FF] dark:bg-[#FF0055]" : "bg-[#00FFCC] dark:bg-[#00AA00]"}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Links Section */}
          <section id="projects" className="w-full flex flex-col items-center space-y-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#0044FF] dark:text-[#00FFCC] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              Explore
            </h2>
            <div className="w-full flex flex-col items-center">
              {links.map((link) => (
                <LinkCard key={link.label} label={link.label} href={link.href} icon={link.icon} />
              ))}
            </div>
          </section>

          {/* Career Section Bento Box -> Brutalist Grid */}
          <section className="w-full flex flex-col items-center space-y-12 border-t-8 border-black dark:border-white pt-24 px-4 w-full">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-6 py-2 border-4 border-black dark:border-white">
              Experience
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-6xl mx-auto text-left">
              
              <div className="group relative p-8 md:p-12 bg-[#FFEB3B] dark:bg-[#E91E63] border-8 border-black dark:border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[24px_24px_0px_0px_rgba(255,255,255,1)] transition-all duration-200">
                <div className="relative z-10">
                  <h3 className="font-black text-4xl md:text-5xl text-black dark:text-white uppercase mb-4 break-keep">
                    개발 교육 및 멘토링
                  </h3>
                  <div className="inline-block bg-black dark:bg-white text-white dark:text-black font-black text-lg md:text-xl px-4 py-2 mb-8 border-4 border-black dark:border-white">
                    프로그래머스 / 오즈코딩스쿨 / 팀스파르타 등
                  </div>
                  <p className="text-xl md:text-2xl text-black dark:text-white font-bold leading-tight mt-4 border-l-8 border-black dark:border-white pl-6 break-keep">
                    100회 이상의 라이브 강의를 진행하며 예비 프론트엔드 개발자들을 이끌었습니다. AI 기반 리뷰 시스템 등 최적화된 프로세스를 도입하여 성취도를 극대화했습니다.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 md:p-12 bg-[#00E5FF] dark:bg-[#76FF03] border-8 border-black dark:border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[24px_24px_0px_0px_rgba(255,255,255,1)] transition-all duration-200">
                <div className="relative z-10">
                  <h3 className="font-black text-5xl md:text-6xl text-black dark:text-dark uppercase mb-4">
                    KC-MIC
                  </h3>
                  <div className="inline-block bg-black dark:bg-black text-white dark:text-[#76FF03] font-black text-xl md:text-2xl px-4 py-2 mb-8 border-4 border-black dark:border-black">
                    2022.03 - 2023.09
                  </div>
                  <p className="text-xl md:text-2xl text-black dark:text-black font-bold leading-tight mt-4 border-l-8 border-black dark:border-black pl-6">
                    반도체 AI 연구 조직에서 프론트엔드 현대화 및 gRPC 실시간 데이터 동기화를 구현했습니다. 복잡한 데이터를 직관적이고 과감하게 시각화하는데 기여했습니다.
                  </p>
                </div>
              </div>

            </div>
          </section>
        </div>

      </main>
      
      {/* Footer */}
      <footer id="contact" className="w-full py-16 mt-20 border-t-8 border-black dark:border-white bg-black dark:bg-white text-center">
        <p className="text-xl md:text-3xl font-black text-[#FF00FF] dark:text-[#FF0055] uppercase tracking-widest mix-blend-difference">
          © {new Date().getFullYear()} YOON CHANG-SIK. DESIGNED FOR AI-NATIVE WORKFLOW.
        </p>
      </footer>
    </div>
  );
}
