import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://my-link-jet.vercel.app";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-link-a2a94";

  // 기본 경로 추가
  const routes: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    // Firestore REST API를 이용해 모든 유저의 displayName 조회
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
            select: {
              fields: [{ fieldPath: "displayName" }, { fieldPath: "updatedAt" }],
            },
            where: {
              fieldFilter: {
                field: { fieldPath: "displayName" },
                op: "GREATER_THAN",
                value: { stringValue: "" },
              },
            },
          },
        }),
        next: { revalidate: 3600 }, // 1시간 캐시
      }
    );

    if (response.ok) {
      const data = await response.json();
      data.forEach((item: any) => {
        const doc = item?.document;
        if (doc) {
          const displayName = doc.fields.displayName?.stringValue;
          const updatedAtStr = doc.fields.updatedAt?.timestampValue;
          
          if (displayName) {
            routes.push({
              url: `${appUrl}/${displayName}`,
              lastModified: updatedAtStr ? new Date(updatedAtStr) : new Date(),
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
        }
      });
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}
