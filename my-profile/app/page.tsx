import Image from "next/image";

export default function Home() {
  const techStack = ["TypeScript", "Next.js", "React", "Tailwind CSS", "AI Agent Pipeline", "Turborepo"];
  const links = [
    { label: "Github", href: "https://github.com/caesiumy" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/chang-sik-yoon" },
    { label: "Blog", href: "https://caesiumy.dev" },
    { label: "Email", href: "mailto:dbs2636@gmail.com" },
  ];

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-6 md:p-12">
      <main className="flex flex-col items-center max-w-2xl w-full text-center space-y-16">
        
        {/* Header Section */}
        <section className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-28 h-28 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
              <span className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">YC</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight text-black dark:text-zinc-50">
              윤창식
            </h1>
            <p className="text-lg text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase">
              AI-Native Software Engineer
            </p>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium">
              "자랑하고 싶은 개발자"
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-6 text-zinc-700 dark:text-zinc-300">
          <p className="text-lg leading-relaxed">
            안녕하세요. 사용자 경험과 시스템 효율성을 모두 고민하는 엔지니어 윤창식입니다. 
            팀스파르타와 KC-MIC에서의 실무 경험을 바탕으로, 
            복잡한 문제를 단순화하고 **AI 에이전트 파이프라인**을 통해 개발 워크플로우를 혁신하는 데 집중하고 있습니다.
          </p>
        </section>

        {/* Tech Stack Section */}
        <section className="w-full space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Core Technologies
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {techStack.map((tech) => (
              <span 
                key={tech} 
                className="px-4 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm transition-transform hover:scale-105"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Career Summary */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-black dark:text-white mb-1">팀스파르타</h3>
            <p className="text-sm text-zinc-500 mb-2">2023.12 - 2025.05</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
              리액트 트랙 튜터로서 80회 이상의 라이브 강의와 AI 기반 리뷰 시스템 구축을 이끌었습니다.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-black dark:text-white mb-1">KC-MIC</h3>
            <p className="text-sm text-zinc-500 mb-2">2022.03 - 2023.09</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
              반도체 AI 연구 조직에서 프론트엔드 현대화 및 gRPC 실시간 데이터 동기화를 구현했습니다.
            </p>
          </div>
        </section>

        {/* Contact Links */}
        <section className="flex flex-wrap justify-center gap-4 pt-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white underline underline-offset-4 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </section>

        {/* Footer */}
        <footer className="pt-20 pb-8 text-xs text-zinc-400 dark:text-zinc-600 tracking-tighter">
          © {new Date().getFullYear()} YOON CHANG-SIK. DESIGNED FOR AI-NATIVE WORKFLOW.
        </footer>
      </main>
    </div>
  );
}
