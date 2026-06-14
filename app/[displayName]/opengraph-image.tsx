import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "My Link - 크리에이터 프로필";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Firestore REST API를 통해 사용자 정보를 가져오는 함수
async function getUserProfile(displayName: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-link-a2a94";
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

    if (!response.ok) return null;
    const data = await response.json();
    const doc = data[0]?.document;
    if (!doc) return null;

    const fields = doc.fields;
    const uid = doc.name.split("/").pop();

    return {
      uid,
      username: fields.username?.stringValue || "User",
      displayName: fields.displayName?.stringValue || displayName,
      bio: fields.bio?.stringValue || "",
      photoURL: fields.photoURL?.stringValue || null,
    };
  } catch (error) {
    console.error("Error fetching user from Firestore REST API", error);
    return null;
  }
}

// 사용자의 링크들을 가져오는 함수
async function getUserLinks(uid: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-link-a2a94";
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}/links`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    const docs = data.documents || [];

    const links = docs.map((doc: any) => {
      const fields = doc.fields;
      return {
        title: fields.title?.stringValue || "Link",
        url: fields.url?.stringValue || "",
        createdAt: fields.createdAt?.timestampValue
          ? new Date(fields.createdAt.timestampValue).getTime()
          : 0,
      };
    });

    // 최신 등록 순 정렬
    links.sort((a: any, b: any) => b.createdAt - a.createdAt);
    return links.slice(0, 3);
  } catch (error) {
    console.error("Error fetching links from Firestore REST API", error);
    return [];
  }
}

// 이미지를 fetch하여 base64 데이터 URI로 변환하는 함수 (CORS 및 엑스박스 렌더링 방지)
async function getBase64Image(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";

    // Edge Runtime 호환 Base64 인코딩
    let base64 = "";
    if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }

    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.error("Failed to fetch image and convert to base64:", e);
    return null;
  }
}

interface ImageParams {
  displayName: string;
}

export default async function Image({
  params,
}: {
  params: Promise<ImageParams>;
}) {
  const { displayName } = await params;

  // 1. 유저 정보 조회
  const user = await getUserProfile(displayName);

  // 2. Pretendard 폰트 로딩
  let fontRegular: ArrayBuffer | undefined;
  let fontBold: ArrayBuffer | undefined;

  try {
    fontRegular = await fetch(
      new URL(
        "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Regular.woff"
      )
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to load Regular font");
      return res.arrayBuffer();
    });

    fontBold = await fetch(
      new URL(
        "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff"
      )
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to load Bold font");
      return res.arrayBuffer();
    });
  } catch (error) {
    console.error("Font fetch failed, fallback to default font:", error);
  }

  // 유저 정보가 없을 때의 디폴트 가이드 이미지 렌더링
  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0b0f19",
            color: "#f8fafc",
            fontFamily: "Pretendard",
          }}
        >
          <span style={{ fontSize: "64px" }}>🔗</span>
          <h1 style={{ fontSize: "40px", fontWeight: 700, marginTop: "24px" }}>
            My Link
          </h1>
          <p style={{ fontSize: "20px", color: "#94a3b8", marginTop: "12px" }}>
            존재하지 않거나 공개되지 않은 크리에이터 프로필입니다.
          </p>
        </div>
      ),
      {
        ...size,
        fonts: fontRegular && fontBold
          ? [
              { name: "Pretendard", data: fontRegular, weight: 400 },
              { name: "Pretendard", data: fontBold, weight: 700 },
            ]
          : [],
      }
    );
  }

  // 3. 사용자의 링크 및 해당 파비콘 로드
  const rawLinks = await getUserLinks(user.uid);
  const links = await Promise.all(
    rawLinks.map(async (link: any) => {
      let domain = "";
      try {
        domain = new URL(link.url).hostname;
      } catch (e) {
        domain = link.url;
      }
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      const base64Favicon = await getBase64Image(faviconUrl);
      return {
        ...link,
        favicon: base64Favicon,
      };
    })
  );

  // 4. 프로필 이미지 Base64 획득
  let base64ProfileImage: string | null = null;
  if (user.photoURL) {
    base64ProfileImage = await getBase64Image(user.photoURL);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#0b0f19",
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(99, 102, 241, 0.22), transparent 45%), radial-gradient(circle at 88% 80%, rgba(6, 182, 212, 0.22), transparent 45%)",
          fontFamily: "Pretendard",
          color: "#f8fafc",
          padding: "60px 80px",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* 왼쪽 영역: 크리에이터 프로필 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "44%",
            justifyContent: "center",
          }}
        >
          {/* 아바타 */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "60px",
              background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "26px",
              boxShadow: "0 12px 28px rgba(99, 102, 241, 0.28)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "112px",
                height: "112px",
                borderRadius: "56px",
                backgroundColor: "#0b0f19",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {base64ProfileImage ? (
                <img
                  src={base64ProfileImage}
                  alt={user.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "44px",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #818cf8, #22d3ee)",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {user.username ? user.username[0].toUpperCase() : "U"}
                </span>
              )}
            </div>
          </div>

          {/* 정보 텍스트 */}
          <h1
            style={{
              fontSize: "46px",
              fontWeight: 800,
              margin: "0 0 6px 0",
              color: "#ffffff",
              letterSpacing: "-1.5px",
              lineHeight: 1.2,
            }}
          >
            {user.username}
          </h1>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#818cf8",
              margin: "0 0 20px 0",
              letterSpacing: "-0.5px",
            }}
          >
            @{user.displayName}
          </p>

          <p
            style={{
              fontSize: "18px",
              color: "#94a3b8",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "380px",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
            }}
          >
            {user.bio || "안녕하세요! 아래 링크에서 제 모든 활동을 확인해 보세요 ✨"}
          </p>
        </div>

        {/* 오른쪽 영역: 링크 프리뷰 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "48%",
            gap: "18px",
            justifyContent: "center",
          }}
        >
          {links.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 40px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed rgba(255, 255, 255, 0.08)",
                borderRadius: "22px",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "32px", marginBottom: "12px" }}>✨</span>
              <span style={{ fontSize: "16px", color: "#64748b" }}>
                아직 등록된 링크가 없습니다.
              </span>
            </div>
          ) : (
            links.map((link, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "20px",
                  padding: "18px 24px",
                  position: "relative",
                  boxSizing: "border-box",
                }}
              >
                {/* 파비콘 프레임 */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "18px",
                    backgroundColor: link.favicon ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {link.favicon ? (
                    <img
                      src={link.favicon}
                      alt=""
                      style={{
                        width: "20px",
                        height: "20px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "16px" }}>🔗</span>
                  )}
                </div>

                {/* 링크 제목 */}
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#e2e8f0",
                    maxWidth: "270px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {link.title}
                </span>

                {/* 우측 화살표 */}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "18px",
                    color: "#818cf8",
                  }}
                >
                  &gt;
                </span>
              </div>
            ))
          )}

          {/* 워터마크 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "12px",
              marginLeft: "auto",
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#818cf8",
                letterSpacing: "0.5px",
              }}
            >
              MY LINK
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontRegular && fontBold
        ? [
            {
              name: "Pretendard",
              data: fontRegular,
              style: "normal",
              weight: 400,
            },
            {
              name: "Pretendard",
              data: fontBold,
              style: "normal",
              weight: 700,
            },
          ]
        : [],
    }
  );
}
