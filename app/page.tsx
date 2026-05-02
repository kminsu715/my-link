"use client";

import { useState, useEffect } from "react";
import { LinkItem } from "@/data/links";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
import { Plus, Loader2, Pencil, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
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
      className="rounded-full w-10 h-10 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50 backdrop-blur-md text-slate-700 dark:text-slate-300 transition-all border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default function Page() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);
  const [deleteLinkTitle, setDeleteLinkTitle] = useState<string>("");

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const linksRef = collection(db, "users/anonymous/links");
      const q = query(linksRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const fetchedLinks: LinkItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          url: data.url,
          clickCount: data.clickCount || 0,
        };
      });
      setLinks(fetchedLinks);
    } catch (error) {
      console.error("Error fetching links: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

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
    let finalUrl = data.url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      const linksRef = collection(db, "users/anonymous/links");
      await addDoc(linksRef, {
        title: data.title,
        url: finalUrl,
        clickCount: 0,
        createdAt: serverTimestamp(),
      });

      form.reset();
      setIsDialogOpen(false);
      fetchLinks();
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
    if (!editingLinkId) return;
    
    let finalUrl = data.url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      const linkRef = doc(db, "users/anonymous/links", editingLinkId);
      await updateDoc(linkRef, {
        title: data.title,
        url: finalUrl,
      });

      setEditingLinkId(null);
      fetchLinks();
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
    if (!deleteLinkId) return;
    
    try {
      const linkRef = doc(db, "users/anonymous/links", deleteLinkId);
      await deleteDoc(linkRef);
      setDeleteLinkId(null);
      fetchLinks();
    } catch (error) {
      console.error("Error deleting link: ", error);
      alert("링크를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center py-20 px-4 sm:px-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-[28rem] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
        
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-400 dark:from-indigo-500/80 dark:to-purple-500/80 p-[2px] shadow-lg shadow-indigo-200 dark:shadow-indigo-500/10">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-transparent overflow-hidden">
              <span className="text-3xl font-bold bg-gradient-to-br from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                M
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Name</h1>
            <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mt-1">@my_link_slug</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-[260px] mx-auto leading-relaxed">
              안녕하세요! 유튜버 겸 크리에이터입니다. 아래 링크에서 제 모든 활동을 확인해 보세요 ✨
            </p>
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
            <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-200 border-white/60 dark:border-slate-800 shadow-2xl">
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
                      className="bg-indigo-600 dark:bg-indigo-500/80 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-white font-semibold px-6 transition-colors w-full sm:w-auto disabled:opacity-50"
                    >
                      {form.formState.isSubmitting ? "추가 중..." : "추가하기"}
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
            <div className="w-full flex flex-col items-center justify-center py-10 opacity-70">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 dark:text-indigo-400 mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">링크를 불러오는 중...</p>
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
                              className="h-8 px-3 text-xs bg-indigo-600 dark:bg-indigo-500/80 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                            >
                              {editForm.formState.isSubmitting ? "저장 중..." : "저장"}
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
                        
                        {/* Title */}
                        <h2 className="w-full text-center text-base font-semibold tracking-wide text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors px-14">
                          {link.title}
                        </h2>
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
