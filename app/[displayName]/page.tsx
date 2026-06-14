"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, doc, updateDoc, increment } from "firebase/firestore";
import { LinkItem } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth-context";

interface PageProps {
  params: Promise<{
    displayName: string;
  }>;
}

interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
}

export default function Page({ params }: PageProps) {
  const { displayName } = use(params);
  const { user } = useAuth();
  
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  
  // 로그인된 세션의 프로필 정보 (Header용)
  const [loginUserProfile, setLoginUserProfile] = useState<any>(null);

  // 1. Target User & Links Fetch
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // displayName으로 유저 검색
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", displayName));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setIsNotFound(true);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // username이 없으면 404 페이지
        if (!userData || !userData.username) {
          setIsNotFound(true);
          return;
        }

        const profileData: UserProfile = {
          uid: userDoc.id,
          username: userData.username,
          displayName: userData.displayName || "",
          bio: userData.bio || "",
          photoURL: userData.photoURL || "",
        };
        
        setTargetUser(profileData);

        // 해당 유저의 links 목록 조회
        const linksRef = collection(db, "users", profileData.uid, "links");
        const linksQuery = query(linksRef, orderBy("createdAt", "desc"));
        const linksSnapshot = await getDocs(linksQuery);

        const fetchedLinks: LinkItem[] = linksSnapshot.docs.map((docSnap) => {
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
      } catch (error) {
        console.error("Error fetching user page: ", error);
        setIsNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [displayName]);

  // 2. 로그인 유저 본인의 프로필 가져오기 (Header 드롭다운 기능용)
  useEffect(() => {
    if (!user) {
      setLoginUserProfile(null);
      return;
    }
    const fetchLoginUserProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const { getDoc } = await import("firebase/firestore");
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setLoginUserProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching login user profile:", err);
      }
    };
    fetchLoginUserProfile();
  }, [user]);

  const handleLinkClick = async (linkId: string) => {
    if (!targetUser) return;
    try {
      const linkRef = doc(db, "users", targetUser.uid, "links", linkId);
      await updateDoc(linkRef, {
        clickCount: increment(1),
      });
    } catch (error) {
      console.error("Error updating click count: ", error);
    }
  };

  if (isNotFound) {
    notFound();
  }

  if (loading) {
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

  if (!targetUser) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col items-center py-20 px-4 sm:px-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      <Header profile={loginUserProfile} />

      <main className="w-full max-w-[28rem] flex flex-col gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-400 dark:from-indigo-500/80 dark:to-purple-500/80 p-[2px] shadow-lg shadow-indigo-200 dark:shadow-indigo-500/10">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-transparent overflow-hidden">
              {targetUser.photoURL ? (
                <img src={targetUser.photoURL} alt={targetUser.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold bg-gradient-to-br from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {targetUser.username[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="w-full flex flex-col items-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 px-2.5 py-0.5 border border-transparent">
              {targetUser.username}
            </h1>
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mt-1 px-2.5 py-0.5 border border-transparent">
              @{targetUser.displayName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-[260px] mx-auto leading-relaxed px-2.5 py-1 border border-transparent">
              {targetUser.bio || "안녕하세요! 아래 링크에서 제 모든 활동을 확인해 보세요 ✨"}
            </p>
          </div>
        </section>

        {/* Links Section */}
        <section className="flex flex-col gap-4 w-full">
          {links.length === 0 ? (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-10">등록된 링크가 없습니다.</p>
          ) : (
            links.map((link, index) => {
              let domain = "";
              try {
                domain = new URL(link.url).hostname;
              } catch (e) {
                domain = link.url;
              }
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

              return (
                <div
                  key={link.id}
                  className="w-full relative group animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="w-full overflow-hidden border border-white/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:bg-white/90 dark:hover:bg-slate-800/70 hover:-translate-y-1 hover:border-indigo-100 dark:hover:border-slate-600 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-lg">
                    <CardContent className="p-0 flex items-center min-h-[64px] relative">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleLinkClick(link.id)}
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
                        
                        {/* Title */}
                        <h2 className="w-full text-center text-base font-semibold tracking-wide text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors px-14">
                          {link.title}
                        </h2>
                      </a>
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
