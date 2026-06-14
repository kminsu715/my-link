"use client";

import { useState, useEffect, useRef } from "react";
import { LinkItem } from "@/data/links";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, onSnapshot, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Pencil, Trash2, Check, X, Eye, Sparkles, Link2, BarChart3, ArrowRight, Share2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";

const linkFormSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요."),
  url: z.string()
    .trim()
    .min(1, "URL을 입력해주세요.")
    .refine((val) => {
      let checkUrl = val;
      if (!checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
        checkUrl = `https://${checkUrl}`;
      }
      
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-가-힣ㄱ-ㅎㅏ-ㅣ]+\.)+[a-zA-Z가-힣]{2,}(\/.*)?$/;
      
      if (checkUrl.startsWith('https://localhost') || checkUrl.startsWith('http://localhost')) {
        return true;
      }
      
      return urlPattern.test(checkUrl);
    }, "유효한 도메인 주소(예: example.com)를 입력해주세요."),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}


interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
}

export default function Page() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);

  // 랜딩 페이지 슬러그 선점 입력 상태
  const [customSlug, setCustomSlug] = useState("");
  const [slugError, setSlugError] = useState("");

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    // 소문자, 숫자, 언더바만 허용하는 정규식
    const sanitized = value.replace(/[^a-z0-9_]/g, "");
    setCustomSlug(sanitized);

    if (value && value !== sanitized) {
      setSlugError("영문 소문자, 숫자, _(언더바)만 사용할 수 있습니다.");
    } else if (sanitized.length > 20) {
      setSlugError("최대 20자까지 입력 가능합니다.");
    } else {
      setSlugError("");
    }
  };

  const handleStartWithSlug = async () => {
    if (slugError) return;
    if (customSlug.trim()) {
      localStorage.setItem("pendingSlug", customSlug.trim());
    }
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };
  const [deleteLinkTitle, setDeleteLinkTitle] = useState<string>("");

  // 프로필 인라인 편집용 상태
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  // 외부 클릭 감지를 위한 refs
  const usernameRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 편집 취소 처리
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isEditingUsername && usernameRef.current && !usernameRef.current.contains(event.target as Node)) {
        setIsEditingUsername(false);
      }
      if (isEditingBio && bioRef.current && !bioRef.current.contains(event.target as Node)) {
        setIsEditingBio(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingUsername, isEditingBio]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLinks([]);
      setIsLoading(false);
      return;
    }

    // 1. Listen for user profile document
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

    // 2. Listen for links (실시간 구독)
    setIsLoading(true);
    const linksRef = collection(db, "users", user.uid, "links");
    const q = query(linksRef, orderBy("createdAt", "desc"));
    const unsubscribeLinks = onSnapshot(q, (snapshot) => {
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
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to links: ", error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeLinks();
    };
  }, [user]);



  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const editForm = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const onSubmit = async (data: LinkFormValues) => {
    if (!user) return;

    let finalUrl = data.url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      const linksRef = collection(db, "users", user.uid, "links");
      await addDoc(linksRef, {
        uid: user.uid,
        title: data.title,
        url: finalUrl,
        clickCount: 0,
        createdAt: serverTimestamp(),
      });

      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding link: ", error);
      alert("링크를 추가하는 중 오류가 발생했습니다.");
    }
  };

  const startEditing = (link: LinkItem) => {
    setEditingLinkId(link.id);
    editForm.reset({
      title: link.title,
      url: link.url,
    });
  };

  const cancelEditing = () => {
    setEditingLinkId(null);
    editForm.reset();
  };

  const onEditSubmit = async (data: LinkFormValues) => {
    if (!user || !editingLinkId) return;
    
    let finalUrl = data.url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      const linkRef = doc(db, "users", user.uid, "links", editingLinkId);
      await updateDoc(linkRef, {
        title: data.title,
        url: finalUrl,
        updatedAt: serverTimestamp(),
      });

      setEditingLinkId(null);
    } catch (error) {
      console.error("Error updating link: ", error);
      alert("링크를 수정하는 중 오류가 발생했습니다.");
    }
  };

  const confirmDelete = (link: LinkItem) => {
    setDeleteLinkId(link.id);
    setDeleteLinkTitle(link.title);
  };

  const handleDelete = async () => {
    if (!user || !deleteLinkId) return;
    
    try {
      const linkRef = doc(db, "users", user.uid, "links", deleteLinkId);
      await deleteDoc(linkRef);
      setDeleteLinkId(null);
    } catch (error) {
      console.error("Error deleting link: ", error);
      alert("링크를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  // 프로필 편집 시작 핸들러
  const startEditingUsername = () => {
    setEditUsername(profile?.username || "");
    setIsEditingUsername(true);
  };


  const startEditingBio = () => {
    setEditBio(profile?.bio || "");
    setIsEditingBio(true);
  };

  // 프로필 업데이트 핸들러
  const handleUpdateUsername = async () => {
    const trimmed = editUsername.trim();
    if (!user || !trimmed) return;
    
    // 원래 값과 같은 경우 업데이트 없이 편집 종료
    if (trimmed === profile?.username) {
      setIsEditingUsername(false);
      return;
    }

    const previousProfile = profile;
    if (profile) {
      setProfile({
        ...profile,
        username: trimmed,
      });
    }
    setIsEditingUsername(false);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: trimmed,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating username: ", error);
      alert("이름 수정 중 오류가 발생했습니다.");
      setProfile(previousProfile);
    }
  };


  const handleUpdateBio = async () => {
    if (!user) return;
    const trimmed = editBio.trim();

    // 원래 값과 같은 경우 업데이트 없이 편집 종료
    if (trimmed === (profile?.bio || "")) {
      setIsEditingBio(false);
      return;
    }

    const previousProfile = profile;
    if (profile) {
      setProfile({
        ...profile,
        bio: trimmed,
      });
    }
    setIsEditingBio(false);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bio: trimmed,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating bio: ", error);
      alert("소개글 수정 중 오류가 발생했습니다.");
      setProfile(previousProfile);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-slate-700" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-5 tracking-wide">준비 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500 overflow-x-hidden w-full">
        <Header />
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[85vh] relative z-10">
          {/* Background decoration */}
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl -z-10" />

          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>1분 만에 완성하는 나만의 링크 페이지</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-cyan-400 bg-clip-text text-transparent">
              나의 모든 링크를<br />단 하나의 페이지로.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              흩어져 있는 유튜브, 인스타그램, 블로그 등 나를 표현하는 모든 채널들을 아름답고 깔끔하게 통합해 보세요. 화면에서 직접 편집하는 WYSIWYG 관리와 실시간 클릭 분석을 제공합니다.
            </p>

            {/* Interactive Slug Form */}
            <div className="flex flex-col gap-3 mt-4 w-full max-w-md">
              <div className="relative flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                <span className="pl-4 text-sm font-semibold text-slate-400 dark:text-slate-500 select-none shrink-0">
                  mylink.com/
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={handleSlugChange}
                  placeholder="yourname"
                  className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 text-sm font-bold placeholder:text-slate-350 dark:placeholder:text-slate-650 px-1 py-2 focus:ring-0"
                />
                <Button
                  onClick={handleStartWithSlug}
                  className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-bold px-5 py-5 rounded-xl transition-all shadow-md shadow-indigo-500/10 shrink-0 cursor-pointer text-xs"
                >
                  시작하기
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Live Preview Info */}
              {customSlug ? (
                <div className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 animate-in fade-in slide-in-from-top-1">
                  생성될 주소: <span className="underline">mylink.com/{customSlug}</span>
                </div>
              ) : slugError ? (
                <div className="text-xs font-semibold text-red-500 dark:text-red-400">
                  {slugError}
                </div>
              ) : (
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  원하는 링크 슬러그를 미리 입력하여 선점해보세요!
                </div>
              )}
            </div>
          </div>

          {/* Hero Right Graphic */}
          <div className="lg:col-span-5 flex justify-center relative w-full pt-6 lg:pt-0">
            {/* Phone Shadow Decoration */}
            <div className="absolute w-[260px] h-[450px] bg-indigo-500/10 dark:bg-indigo-400/5 rounded-[45px] blur-3xl -z-10" />
            
            {/* Phone Mockup Frame */}
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[290px] aspect-[9/18.5] bg-slate-950 dark:bg-slate-900/90 rounded-[42px] p-2.5 shadow-2xl border-4 border-slate-900 dark:border-slate-800/80 transform transition-all duration-700 hover:scale-[1.03] hover:-rotate-y-6 hover:rotate-x-3 hover:translate-y-[-4px] group">
              {/* Camera Island */}
              <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              </div>
              
              {/* Mockup Screen */}
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[34px] overflow-hidden p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-900 relative">
                {/* Visual Content Inside Phone */}
                <div className="w-full flex flex-col items-center text-center gap-3 mt-6">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[2px] shadow-sm">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                      <span className="text-lg font-black bg-gradient-to-br from-indigo-500 to-cyan-500 bg-clip-text text-transparent">ML</span>
                    </div>
                  </div>
                  
                  {/* Name and bio */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">마이링크 크리에이터</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[150px] leading-relaxed mx-auto">
                      안녕하세요! 이곳에서 저의 모든 채널을 찾아볼 수 있습니다 🚀
                    </p>
                  </div>
                </div>

                {/* Simulated Link Items */}
                <div className="w-full flex flex-col gap-2.5 my-3">
                  <div className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transform transition-all hover:scale-[1.02] cursor-pointer">
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-bold">
                      YT
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate">유튜브 채널 바로가기</div>
                    </div>
                    <div className="text-[9px] font-medium text-slate-450 dark:text-slate-500 shrink-0">1.2k views</div>
                  </div>

                  <div className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transform transition-all hover:scale-[1.02] cursor-pointer">
                    <div className="w-6.5 h-6.5 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 text-[10px] font-bold">
                      IG
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate">인스타그램 일상 피드</div>
                    </div>
                    <div className="text-[9px] font-medium text-slate-450 dark:text-slate-500 shrink-0">842 views</div>
                  </div>

                  <div className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm transform transition-all hover:scale-[1.02] cursor-pointer">
                    <div className="w-6.5 h-6.5 rounded-full bg-slate-900/10 dark:bg-slate-100/10 flex items-center justify-center text-slate-800 dark:text-slate-205 text-[10px] font-bold">
                      GH
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate">깃허브 포트폴리오</div>
                    </div>
                    <div className="text-[9px] font-medium text-slate-455 dark:text-slate-500 shrink-0">624 views</div>
                  </div>
                </div>

                {/* Simulated Click Overlay (Mini Chart mockup) */}
                <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 dark:from-indigo-500 dark:to-cyan-500 text-white p-2.5 rounded-xl text-center space-y-0.5 shadow-md">
                  <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Today's click count</div>
                  <div className="text-xs font-black tracking-tight">Total 2,668 hits! 🚀</div>
                </div>
                
                {/* Home Indicator */}
                <div className="w-16 h-1 bg-slate-300 dark:bg-slate-800 rounded-full mx-auto mt-2 shrink-0" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="w-full bg-white dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50 py-20 md:py-24 relative z-10 transition-colors duration-500">
          <div className="max-w-5xl mx-auto px-6">
            {/* Header */}
            <div className="text-center space-y-3 mb-16 max-w-xl mx-auto">
              <h2 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                FEATURES
              </h2>
              <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                가장 완벽한 링크 관리 도구
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                나를 보여주는 링크 목록, 더 이상 고민하지 마세요. 필요한 모든 기능을 극대화된 사용성으로 담아냈습니다.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1: WYSIWYG */}
              <Card className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Pencil className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  직관적인 인라인 편집 (WYSIWYG)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  화면을 보면서 이름, 설명 등 원하는 글자를 바로 클릭하고 수정해 보세요. 번거로운 저장 단계 없이 실시간으로 적용됩니다.
                </p>
              </Card>

              {/* Feature 2: Favicon */}
              <Card className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Link2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  자동 로고(Favicon) 불러오기
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  웹사이트 주소(URL)만 입력하면 구글 API가 알아서 해당 서비스의 공식 고화질 로고를 매칭해 줍니다. 굳이 아이콘을 업로드할 필요가 없어요.
                </p>
              </Card>

              {/* Feature 3: Analytics */}
              <Card className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  실시간 방문 및 클릭 분석
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  내 채널 중 어떤 채널이 가장 인기가 높은지 실시간으로 분석해 드립니다. 깔끔한 대시보드로 방문자 트래픽의 인사이트를 확보하세요.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20 md:py-24 relative z-10">
          <div className="text-center space-y-3 mb-16 max-w-xl mx-auto">
            <h2 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
              HOW IT WORKS
            </h2>
            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              로그인부터 배포까지 단 3단계
            </p>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center px-4 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-500/20 z-10 shrink-0">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">Google로 가입</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
                구글 간편 소셜 로그인을 통해 이메일 인증 절차 없이 3초 만에 나만의 공간을 생성합니다.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-[-16px] h-0.5 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center px-4 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-500/20 z-10 shrink-0">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">링크 및 설명 수정</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
                글자를 클릭해서 이름과 소개글을 수정하고, 자주 이용하는 플랫폼 링크를 채워보세요.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-[-16px] h-0.5 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center px-4 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-500/20 z-10 shrink-0">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">나만의 프로필 공유</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
                완성된 고유 링크 주소를 인스타그램 바이오, 트위터, 유튜브 하단 정보란 등에 등록해 보세요.
              </p>
            </div>
          </div>
        </section>

        {/* CTA (Call To Action) Section */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-24 relative z-10">
          <div className="bg-gradient-to-tr from-indigo-900 via-indigo-950 to-cyan-900 dark:from-slate-900 dark:via-indigo-950/70 dark:to-slate-900 border border-indigo-500/20 dark:border-indigo-500/10 p-10 md:p-16 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden">
            {/* Background glowing */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10" />

            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                지금 나만의 링크를 시작해 보세요.
              </h2>
              <p className="text-sm md:text-base text-slate-300 dark:text-slate-400 leading-relaxed">
                디자이너, 개발자, 인플루언서 등 전 세계 모든 크리에이터들이 마이링크를 통해 본인의 가치를 표현하고 있습니다.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={signInWithGoogle}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-sm cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-800" viewBox="0 0 24 24">
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
                <span>Google 계정으로 무료 시작하기</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/50 py-8 text-center bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-400 dark:text-slate-600 transition-colors duration-500">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-semibold">
              © {new Date().getFullYear()} My Link. All rights reserved.
            </p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:underline">이용약관</span>
              <span>•</span>
              <span className="cursor-pointer hover:underline">개인정보처리방침</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center py-20 px-4 sm:px-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      <Header totalLinks={links.length} profile={profile} />

      <main className="w-full max-w-[28rem] flex flex-col gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
        
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-400 dark:from-indigo-500/80 dark:to-purple-500/80 p-[2px] shadow-lg shadow-indigo-200 dark:shadow-indigo-500/10">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-transparent overflow-hidden">
              {user?.photoURL || profile?.photoURL ? (
                <img src={user?.photoURL || profile?.photoURL || undefined} alt={profile?.username || "User"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold bg-gradient-to-br from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {profile?.username ? profile.username[0].toUpperCase() : "M"}
                </span>
              )}
            </div>
          </div>
          <div className="w-full flex flex-col items-center">
            {/* Username Edit Form */}
            {isEditingUsername ? (
              <div ref={usernameRef} className="flex items-center justify-center gap-1.5 mt-1.5">
                <Input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-48 text-center text-lg font-bold h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                  placeholder="이름 입력"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateUsername();
                    if (e.key === "Escape") setIsEditingUsername(false);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 rounded-full text-green-600 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer"
                  onClick={handleUpdateUsername}
                  disabled={!editUsername.trim()}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  onClick={() => setIsEditingUsername(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <h1
                onClick={startEditingUsername}
                className="group inline-flex items-center justify-center gap-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg px-2.5 py-0.5 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                {profile?.username || "My Name"}
                <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}

            {/* DisplayName (URL Slug) */}
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mt-1 px-2.5 py-0.5 border border-transparent">
              @{profile?.displayName || "my_link_slug"}
            </p>

            {/* Bio Edit Form */}
            {isEditingBio ? (
              <div ref={bioRef} className="flex flex-col items-center gap-1.5 mt-2 w-full max-w-[280px] mx-auto">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full text-center text-sm min-h-[60px] max-h-[120px] p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none text-slate-800 dark:text-slate-200"
                  placeholder="소개글 입력"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleUpdateBio();
                    }
                    if (e.key === "Escape") setIsEditingBio(false);
                  }}
                />
                <div className="flex gap-2 justify-end w-full">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    onClick={() => setIsEditingBio(false)}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500/80 dark:hover:bg-indigo-500 text-white cursor-pointer"
                    onClick={handleUpdateBio}
                  >
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <p
                onClick={startEditingBio}
                className="group inline-flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-[260px] mx-auto leading-relaxed cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg px-2.5 py-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                {profile?.bio || "안녕하세요! 아래 링크에서 제 모든 활동을 확인해 보세요 ✨"}
                <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </p>
            )}
          </div>
        </section>

        {/* Links Section */}
        <section className="flex flex-col gap-4 w-full">
          {/* Add Link Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full bg-white/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white border border-white/60 dark:border-slate-700/50 backdrop-blur-xl rounded-xl py-6 font-semibold transition-all shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-lg dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5">
                <Plus className="w-5 h-5 mr-2" />
                링크 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-200 border-white/60 dark:border-slate-880 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">새로운 링크 추가</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  추가할 링크의 제목과 URL 주소를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-5 py-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-start gap-4 space-y-0">
                          <FormLabel className="text-right text-slate-600 dark:text-slate-400 font-medium mt-3">
                            제목
                          </FormLabel>
                          <div className="col-span-3">
                            <FormControl>
                              <Input
                                placeholder="예: 내 블로그"
                                className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors aria-[invalid=true]:border-red-500 dark:aria-[invalid=true]:border-red-500/50 aria-[invalid=true]:focus-visible:ring-red-500 aria-[invalid=true]:focus-visible:border-red-500"
                                autoComplete="off"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 dark:text-red-400 text-xs mt-1.5" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-start gap-4 space-y-0">
                          <FormLabel className="text-right text-slate-600 dark:text-slate-400 font-medium mt-3">
                            URL 주소
                          </FormLabel>
                          <div className="col-span-3">
                            <FormControl>
                              <Input
                                placeholder="https://example.com"
                                className="bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors aria-[invalid=true]:border-red-500 dark:aria-[invalid=true]:border-red-500/50 aria-[invalid=true]:focus-visible:ring-red-500 aria-[invalid=true]:focus-visible:border-red-500"
                                autoComplete="off"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 dark:text-red-400 text-xs mt-1.5" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting}
                      className="bg-indigo-600 dark:bg-indigo-500/80 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-white font-semibold px-6 transition-colors w-full sm:w-auto disabled:opacity-70 min-w-[88px]"
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : "추가하기"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteLinkId} onOpenChange={(open) => !open && setDeleteLinkId(null)}>
            <DialogContent className="sm:max-w-[400px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-200 border-white/60 dark:border-slate-800 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">정말 삭제하시겠습니까?</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{deleteLinkTitle}</span> 링크를 삭제합니다.
                  <br />
                  <span className="text-red-500 dark:text-red-400 font-medium mt-3 inline-block">이 작업은 되돌릴 수 없습니다.</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <Button 
                  variant="ghost" 
                  onClick={() => setDeleteLinkId(null)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  취소
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 dark:border-transparent"
                >
                  삭제하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center py-16">
              <div className="relative">
                {/* 바깥 링 */}
                <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-slate-700" />
                {/* 회전 스피너 */}
                <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
                {/* 중앙 점 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-5 tracking-wide">불러오는 중...</p>
            </div>
          ) : (
            links.map((link, index) => {
              if (editingLinkId === link.id) {
                return (
                  <Card key={link.id} className="w-full overflow-hidden border border-indigo-200 dark:border-indigo-500/30 bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
                    <CardContent className="p-4">
                      <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col gap-3">
                          <FormField
                            control={editForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormControl>
                                  <Input
                                    placeholder="제목"
                                    className="h-9 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500 transition-colors aria-[invalid=true]:border-red-500 dark:aria-[invalid=true]:border-red-500/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormControl>
                                  <Input
                                    placeholder="URL"
                                    className="h-9 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500 transition-colors aria-[invalid=true]:border-red-500 dark:aria-[invalid=true]:border-red-500/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2 justify-end mt-1">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={cancelEditing}
                              className="h-8 px-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              취소
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={editForm.formState.isSubmitting}
                              className="h-8 px-3 text-xs bg-indigo-600 dark:bg-indigo-500/80 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none min-w-[44px]"
                            >
                              {editForm.formState.isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : "저장"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                );
              }

              let domain = "";
              try {
                domain = new URL(link.url).hostname;
              } catch (e) {
                domain = link.url; // fallback if invalid url
              }
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

              return (
                <div
                  key={link.id}
                  className="w-full relative group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="w-full overflow-hidden border border-white/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:bg-white/90 dark:hover:bg-slate-800/70 hover:-translate-y-1 hover:border-indigo-100 dark:hover:border-slate-600 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-lg">
                    <CardContent className="p-0 flex items-center min-h-[64px] relative">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center p-4 outline-none w-full"
                      >
                        {/* Favicon */}
                        <div className="absolute left-4 w-10 h-10 rounded-full bg-white dark:bg-slate-900/50 flex items-center justify-center p-2 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
                          <img 
                            src={faviconUrl} 
                            alt={`${link.title} icon`} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        
                        {/* Title & Click Count */}
                        <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-12 gap-1 select-none">
                          <h2 className="w-full text-center text-base font-semibold tracking-wide text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                            {link.title}
                          </h2>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100/70 dark:bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800/80 shadow-sm shrink-0">
                            <Eye className="w-3.5 h-3.5 text-indigo-400/80 dark:text-indigo-400" />
                            <span>{link.clickCount || 0}</span>
                          </div>
                        </div>
                      </a>
                      
                      {/* Action Buttons */}
                      <div className="absolute right-3 flex gap-1 z-10 opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.preventDefault(); startEditing(link); }}
                          className="w-8 h-8 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.preventDefault(); confirmDelete(link); }}
                          className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
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
