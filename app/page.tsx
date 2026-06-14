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
import { Plus, Loader2, Pencil, Trash2, Check, X, Eye } from "lucide-react";
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
      <div className="flex min-h-svh flex-col items-center py-20 px-4 sm:px-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500">
        <Header />
        
        <main className="w-full max-w-2xl flex flex-col gap-12 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 items-center text-center">
          {/* Hero Content */}
          <div className="space-y-6 max-w-lg mt-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/30">
              ✨ 1분 만에 끝내는 링크 관리
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-r from-indigo-600 via-slate-900 to-indigo-500 dark:from-indigo-400 dark:via-white dark:to-cyan-400 bg-clip-text text-transparent">
              나만의 모든 링크를<br />단 하나의 페이지로.
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              유튜브, 블로그, SNS 등 분산된 나의 채널들을 아름답게 통합하세요. Google 로그인 한 번으로 프로필 구축부터 실시간 관리까지 직관적인 경험을 제공합니다.
            </p>
          </div>

          {/* Call To Action Card */}
          <Card className="w-full max-w-md border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center gap-6 rounded-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />

            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">서비스 이용을 위해 로그인이 필요합니다</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] leading-normal mx-auto">
                구글 소셜 계정으로 로그인하시면 고유 프로필 및 무제한 링크 생성 기능을 무료로 이용하실 수 있습니다.
              </p>
            </div>

            <Button
              onClick={signInWithGoogle}
              className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-semibold py-6 rounded-xl shadow-lg shadow-indigo-500/20 dark:shadow-none hover:shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 text-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
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
              <span>Google 계정으로 시작하기</span>
            </Button>
          </Card>
        </main>
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
