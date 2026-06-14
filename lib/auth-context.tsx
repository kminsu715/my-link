"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Google user with Firestore users/{uid}
  const syncUserToFirestore = async (currentUser: User) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const emailPrefix = currentUser.email ? currentUser.email.split("@")[0] : "user";

      if (!userSnap.exists()) {
        const pendingSlug = typeof window !== "undefined" ? localStorage.getItem("pendingSlug") : null;
        // 슬러그 포맷 제한 (소문자, 숫자, 언더바만 가능하도록 안전 필터링)
        const sanitizedSlug = pendingSlug ? pendingSlug.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") : "";
        const finalSlug = sanitizedSlug || emailPrefix;

        await setDoc(userRef, {
          uid: currentUser.uid,
          username: currentUser.displayName || emailPrefix,
          displayName: finalSlug, // Used as the URL slug
          bio: "안녕하세요! 아래 링크에서 제 모든 활동을 확인해 보세요 ✨",
          photoURL: currentUser.photoURL || "",
          email: currentUser.email || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingSlug");
        }
      } else {
        const userData = userSnap.data();
        const updates: any = {};

        if (!userData.uid) {
          updates.uid = currentUser.uid;
        }

        // 기존 사용자의 displayName이 없을 경우에만 기본값 지정 (강제 동기화 제거)
        if (!userData.displayName) {
          updates.displayName = emailPrefix;
        }

        if (currentUser.photoURL && userData.photoURL !== currentUser.photoURL) {
          updates.photoURL = currentUser.photoURL;
        }

        if (Object.keys(updates).length > 0) {
          await setDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      }
    } catch (error) {
      console.error("Error syncing user to firestore: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await syncUserToFirestore(currentUser);
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in failed: ", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed: ", error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
