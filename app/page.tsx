"use client";

import { dummyLinks } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center py-20 px-4 sm:px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-slate-100 font-sans selection:bg-indigo-500/30">
      <main className="w-full max-w-[28rem] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-transparent overflow-hidden">
              <span className="text-3xl font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                M
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">My Name</h1>
            <p className="text-sm font-medium text-indigo-400 mt-1">@my_link_slug</p>
            <p className="text-sm text-slate-400 mt-3 max-w-[260px] mx-auto leading-relaxed">
              안녕하세요! 유튜버 겸 크리에이터입니다. 아래 링크에서 제 모든 활동을 확인해 보세요 ✨
            </p>
          </div>
        </section>

        {/* Links Section */}
        <section className="flex flex-col gap-4 w-full">
          {dummyLinks.map((link, index) => {
            const domain = new URL(link.url).hostname;
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full outline-none"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="w-full overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]">
                  <CardContent className="p-4 flex items-center min-h-[64px] relative group">
                    {/* Favicon */}
                    <div className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={faviconUrl} 
                        alt={`${link.title} icon`} 
                        className="w-full h-full object-contain drop-shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    
                    {/* Title */}
                    <h2 className="w-full text-center text-base font-semibold tracking-wide text-slate-200 group-hover:text-white transition-colors">
                      {link.title}
                    </h2>
                    
                    {/* Right Arrow (subtle) */}
                    <div className="absolute right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"/>
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="text-center mt-8 pb-8">
          <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
            Powered by My Link
          </p>
        </footer>
      </main>
    </div>
  );
}
