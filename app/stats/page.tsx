"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { LinkItem } from "@/data/links";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowLeft, BarChart3, Link2, Eye, Award, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
}

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Client-side hydration safety check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Fetch Profile & Links from Firestore (Real-time listener)
  useEffect(() => {
    if (!user) return;

    // 1. Fetch Profile
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          username: data.username || "",
          displayName: data.displayName || "",
          bio: data.bio || "",
          photoURL: data.photoURL || "",
        });
      }
    });

    // 2. Fetch Links
    const linksRef = collection(db, "users", user.uid, "links");
    const q = query(linksRef, orderBy("createdAt", "desc"));
    const unsubscribeLinks = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLinks: LinkItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title,
            url: data.url,
            clickCount: data.clickCount || 0,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
          };
        });
        setLinks(fetchedLinks);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to links: ", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeLinks();
    };
  }, [user]);

  if (authLoading || loading || !mounted) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-slate-700" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-5 tracking-wide">데이터 불러오는 중...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect shortly
  }

  // Calculate statistics
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  
  // Find top performed link
  const sortedLinks = [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
  const topLink = sortedLinks.length > 0 && sortedLinks[0].clickCount && sortedLinks[0].clickCount > 0 ? sortedLinks[0] : null;

  // Chart data configuration (Top 7 links by clickCount)
  const chartData = sortedLinks
    .slice(0, 7)
    .map((link, index) => {
      // Hex colors array to present nice bar colors
      const colors = ["#6366f1", "#06b6d4", "#a855f7", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"];
      return {
        name: link.title.length > 10 ? link.title.substring(0, 10) + "..." : link.title,
        clicks: link.clickCount || 0,
        fill: colors[index % colors.length],
      };
    })
    .reverse(); // Reverse to show highest clicks at the top or bottom appropriately

  const chartConfig = {
    clicks: {
      label: "클릭 수",
      color: "var(--color-clicks)",
    },
  };

  return (
    <div className="flex min-h-svh flex-col items-center py-20 px-4 sm:px-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      <Header totalLinks={totalLinks} profile={profile} />

      <main className="w-full max-w-4xl flex flex-col gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
        {/* Navigation & Title */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="rounded-full border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                링크 분석 통계
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                등록된 각 링크의 방문 및 클릭 성과를 실시간으로 확인합니다.
              </p>
            </div>
          </div>
          
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500/80 dark:hover:bg-indigo-500 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/10 transition-all text-xs cursor-pointer px-4 h-9 self-start sm:self-auto"
          >
            <Link href={`/${profile?.displayName || ""}`} target="_blank">
              내 페이지 가기 <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Clicks */}
          <Card className="border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                총 클릭 수
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-100/30">
                <Eye className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {totalClicks.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                모든 링크의 실시간 누적 클릭 횟수
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Links */}
          <Card className="border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                등록된 링크
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-500 dark:text-cyan-400 border border-cyan-100/30">
                <Link2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {totalLinks.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                공개 프로필에 게시 중인 연결 링크 수
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Top Performing Link */}
          <Card className="border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                가장 인기 있는 링크
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-500 dark:text-violet-400 border border-violet-100/30">
                <Award className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {topLink ? (
                <>
                  <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {topLink.title}
                  </div>
                  <p className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-2 font-semibold flex items-center gap-1">
                    <span>{topLink.clickCount || 0}회 클릭됨</span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      전체의 {Math.round(((topLink.clickCount || 0) / (totalClicks || 1)) * 100)}% 차지
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold text-slate-400 dark:text-slate-500 py-1">
                    인기 링크 정보가 없습니다
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-2">
                    아직 생성된 클릭 수 기록이 없습니다.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                인기 링크 클릭 분포 (최대 7개)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-slate-500">
                가장 클릭이 많이 발생한 링크들의 성과 분포 차트입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {totalClicks > 0 && chartData.length > 0 ? (
                <div className="h-[280px] w-full">
                  <ChartContainer config={chartConfig} className="w-full h-full max-h-[280px]">
                    <BarChart
                      layout="vertical"
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-800" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        className="text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                        width={100}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="clicks"
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                        background={{ fill: "rgba(0,0,0,0.02)", radius: 6 }}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="h-[240px] flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">데이터가 불충분합니다</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed">
                      링크들의 클릭 기록이 발생하면 차트 분석 결과가 표시됩니다. 링크를 홍보해보세요!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Links Stats List */}
        <Card className="border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              상세 클릭 리스트
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 dark:text-slate-500">
              클릭 수가 많은 순서대로 모든 링크가 정렬되어 표시됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {links.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400 dark:text-slate-500">
                등록된 링크가 존재하지 않습니다.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sortedLinks.map((link, idx) => {
                  let hostname = "";
                  try {
                    hostname = new URL(link.url).hostname;
                  } catch (e) {
                    hostname = link.url;
                  }
                  
                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                        {/* Rank Badge */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                            : idx === 1
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : idx === 2
                            ? "bg-amber-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-500"
                            : "bg-slate-100/80 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500"
                        }`}>
                          {idx + 1}
                        </div>

                        {/* Title & URL */}
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {link.title}
                          </h3>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate flex items-center gap-1 mt-0.5"
                          >
                            {hostname}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* Click count display */}
                      <div className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-100/70 dark:bg-slate-900/60 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800/80 shadow-sm shrink-0">
                          <Eye className="w-3.5 h-3.5 text-indigo-400/80 dark:text-indigo-400" />
                          <span>{link.clickCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Footer */}
        <footer className="text-center mt-6 pb-8">
          <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
            Powered by My Link Stats
          </p>
        </footer>
      </main>
    </div>
  );
}
