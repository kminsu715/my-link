import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 p-4 transition-colors duration-500">
      <div className="w-full max-w-md border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center gap-6 rounded-2xl relative overflow-hidden text-center">
        {/* 배경 장식 */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-red-400/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />

        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 flex items-center justify-center text-red-500 dark:text-red-400 shadow-inner animate-bounce">
          <Frown className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">404</h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">페이지를 찾을 수 없습니다</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[300px] leading-normal mx-auto">
            요청하신 주소가 잘못되었거나 존재하지 않는 사용자 페이지입니다.
            <br />
            링크 주소를 다시 확인해 주세요.
          </p>
        </div>

        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-semibold py-6 rounded-xl shadow-lg shadow-indigo-500/20 dark:shadow-none hover:shadow-xl transition-all cursor-pointer">
          <Link href="/" className="flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로 돌아가기</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
