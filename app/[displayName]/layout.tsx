import { Metadata } from "next";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    displayName: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ displayName: string }>;
}): Promise<Metadata> {
  const { displayName } = await params;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-link-a2a94";

  let title = `@${displayName} | My Link`;
  let description = "My Link 프로필 페이지";
  let username = displayName;

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "users" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "displayName" },
                op: "EQUAL",
                value: { stringValue: displayName },
              },
            },
            limit: 1,
          },
        }),
        next: { revalidate: 60 },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const doc = data[0]?.document;
      if (doc) {
        username = doc.fields.username?.stringValue || displayName;
        const bio = doc.fields.bio?.stringValue || "";
        title = `${username} (@${displayName}) | My Link`;
        if (bio) {
          description = bio;
        } else {
          description = `${username}님의 프로필 링크 페이지입니다. 등록된 채널과 중요한 링크들을 확인해 보세요!`;
        }
      }
    }
  } catch (error) {
    console.error("Error generating metadata for user layout:", error);
  }

  return {
    title,
    description,
    keywords: [username, displayName, "프로필링크", "마이링크", "link-in-bio", "링크모음"],
    alternates: {
      canonical: `/${displayName}`,
    },
    openGraph: {
      title,
      description,
      type: "profile",
      username: displayName,
      url: `/${displayName}`,
      siteName: "My Link",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function UserLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
