import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import LinkCard from "../components/LinkCard";

export default function Home() {
  const techStack = ["TypeScript", "Next.js", "React", "Tailwind CSS", "AI Agent Pipeline", "Turborepo"];
  
  const links = [
    { 
      label: "Github", 
      href: "https://github.com/caesiumy",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
      )
    },
    { 
      label: "LinkedIn", 
      href: "https://www.linkedin.com/in/chang-sik-yoon",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      )
    },
    { 
      label: "Blog", 
      href: "https://caesiumy.dev",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
      )
    },
    { 
      label: "Email", 
      href: "mailto:dbs2636@gmail.com",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      )
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black text-foreground relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-40 -right-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <Header />

      <main className="flex-grow flex flex-col items-center pt-32 pb-16 px-6 md:px-12 w-full max-w-3xl mx-auto space-y-20 z-10">
        
        <HeroSection />

        <div className="flex flex-col items-center w-full space-y-12">
          {/* Tech Stack Section */}
          <section id="about" className="w-full space-y-6 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Core Technologies
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {techStack.map((tech) => (
                <span 
                  key={tech} 
                  className="px-4 py-1.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 text-sm font-semibold text-zinc-700 dark:text-zinc-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Links Section */}
          <section id="projects" className="w-full flex flex-col items-center space-y-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-2">
              Connect & Explore
            </h2>
            {links.map((link) => (
              <LinkCard key={link.label} label={link.label} href={link.href} icon={link.icon} />
            ))}
          </section>

          {/* Career Section */}
          <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-bold tracking-tight text-xl text-black dark:text-white mb-1">팀스파르타</h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">2023.12 - 2025.05</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                리액트 트랙 튜터로서 80회 이상의 라이브 강의와 AI 기반 리뷰 시스템 구축을 이끌었습니다.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-bold tracking-tight text-xl text-black dark:text-white mb-1">KC-MIC</h3>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wider">2022.03 - 2023.09</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                반도체 AI 연구 조직에서 프론트엔드 현대화 및 gRPC 실시간 데이터 동기화를 구현했습니다.
              </p>
            </div>
          </section>
        </div>

      </main>
      
      {/* Footer */}
      <footer id="contact" className="w-full py-8 text-center text-xs text-zinc-400 dark:text-zinc-600 tracking-tighter backdrop-blur-sm border-t border-zinc-100 dark:border-zinc-900 absolute bottom-0">
        © {new Date().getFullYear()} YOON CHANG-SIK. DESIGNED FOR AI-NATIVE WORKFLOW.
      </footer>
    </div>
  );
}
