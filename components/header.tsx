"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full w-10 h-10 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 backdrop-blur-md text-slate-700 dark:text-slate-300 transition-all border border-slate-200/30 dark:border-slate-700/30 shadow-sm"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Header({ totalLinks = 0, profile = null }: { totalLinks?: number; profile?: any }) {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const userSlug = profile?.displayName || (user?.email ? user.email.split("@")[0] : "");

  const copyToClipboard = () => {
    if (!userSlug) return;
    const url = `${window.location.origin}/${userSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openPublicLink = () => {
    if (!userSlug) return;
    const url = `${window.location.origin}/${userSlug}`;
    window.open(url, "_blank");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <span className="text-white font-black text-sm tracking-tighter">ML</span>
          </div>
          <span className="font-heading font-black text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            My Link
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <ThemeToggle />

          {loading ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          ) : user ? (
            <>
              {/* 내 페이지 바로가기 버튼 (새 탭) */}
              {userSlug && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex rounded-full border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-3 sm:px-4 cursor-pointer text-xs font-semibold"
                >
                  <Link href={`/${userSlug}`} target="_blank" rel="noopener noreferrer">
                    내 페이지
                  </Link>
                </Button>
              )}

              {/* User Avatar (Clickable to open dropdown) */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative group focus:outline-none transition-transform active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[2px] shadow-sm hover:shadow-indigo-500/20 hover:scale-105 transition-all">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-full h-full object-cover rounded-full bg-white dark:bg-slate-900"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-sm">
                      {profile?.username ? profile.username[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              </button>

              {/* Minimal Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-13 z-50 w-56 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Action 1: Preview My Page */}
                  {userSlug && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openPublicLink();
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      내 페이지 미리보기
                    </button>
                  )}

                  {/* Action 2: Copy Link */}
                  {userSlug && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <Copy className="w-4 h-4 text-slate-400" />
                        링크 복사
                      </span>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : null}
                    </button>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-slate-100 dark:bg-slate-950 my-1" />

                  {/* Action 3: Logout */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>

                </div>
              )}
            </>
          ) : (
            <Button
              onClick={handleLogin}
              disabled={isSigningIn}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full px-5 py-2 font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>구글 로그인</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
