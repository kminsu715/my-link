import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "My Link - 나의 모든 링크를 단 하나의 페이지로";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let fontRegular: ArrayBuffer | undefined;
  let fontBold: ArrayBuffer | undefined;

  try {
    fontRegular = await fetch(
      new URL("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Regular.woff")
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to load Regular font");
      return res.arrayBuffer();
    });

    fontBold = await fetch(
      new URL("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff")
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to load Bold font");
      return res.arrayBuffer();
    });
  } catch (error) {
    console.error("Font fetch failed, fallback to default font:", error);
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
            "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15), transparent 45%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15), transparent 45%)",
          fontFamily: "Pretendard",
          color: "#f8fafc",
          padding: "60px 80px",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* 왼쪽 영역: 히어로 텍스트 및 배지 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "52%",
            justifyContent: "center",
          }}
        >
          {/* 배지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              alignSelf: "flex-start",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "16px" }}>✨</span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#818cf8",
                letterSpacing: "-0.5px",
              }}
            >
              1분 만에 완성하는 나만의 링크 페이지
            </span>
          </div>

          {/* 메인 타이틀 */}
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.25,
              margin: "0 0 24px 0",
              letterSpacing: "-2.5px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>나의 모든 링크를</span>
            <span
              style={{
                background: "linear-gradient(to right, #ffffff, #818cf8, #22d3ee)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              단 하나의 페이지로.
            </span>
          </h1>

          {/* 설명글 */}
          <p
            style={{
              fontSize: "18px",
              color: "#94a3b8",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "480px",
              letterSpacing: "-0.5px",
            }}
          >
            흩어져 있는 유튜브, 인스타그램, 블로그 등 나를 표현하는 모든 채널들을 아름답고 깔끔하게 통합해 보세요. 화면에서 직접 편집하는 WYSIWYG 관리와 실시간 클릭 분석을 제공합니다.
          </p>
        </div>

        {/* 오른쪽 영역: 폰 모형 그래픽 */}
        <div
          style={{
            display: "flex",
            width: "42%",
            justifyContent: "center",
          }}
        >
          {/* Phone Frame Mockup */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "300px",
              backgroundColor: "#030712",
              borderRadius: "36px",
              padding: "16px",
              border: "4px solid #1f2937",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            {/* Phone Notch/Island */}
            <div
              style={{
                position: "absolute",
                top: "6px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "90px",
                height: "12px",
                backgroundColor: "#030712",
                borderRadius: "9999px",
                display: "flex",
              }}
            />

            {/* Screen Inner */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#090d16",
                borderRadius: "26px",
                padding: "20px 14px 14px 14px",
                boxSizing: "border-box",
              }}
            >
              {/* Profile Block */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "28px",
                    background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "26px",
                      backgroundColor: "#0b0f19",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #818cf8, #22d3ee)",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      ML
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
                  마이링크 크리에이터
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    marginTop: "4px",
                    maxWidth: "180px",
                    lineHeight: 1.4,
                  }}
                >
                  안녕하세요! 이곳에서 저의 모든 채널을 찾아볼 수 있습니다 🚀
                </span>
              </div>

              {/* Links Mockup */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {/* Link 1 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "11px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444" }}>YT</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#cbd5e1" }}>
                    유튜브 채널 바로가기
                  </span>
                </div>

                {/* Link 2 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "11px",
                      backgroundColor: "rgba(236, 72, 153, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#ec4899" }}>IG</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#cbd5e1" }}>
                    인스타그램 일상 피드
                  </span>
                </div>

                {/* Link 3 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "11px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#f8fafc" }}>GH</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#cbd5e1" }}>
                    깃허브 포트폴리오
                  </span>
                </div>
              </div>

              {/* Click Count Mockup */}
              <div
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span style={{ fontSize: "8px", fontWeight: 700, color: "#ffffff", opacity: 0.8, letterSpacing: "0.5px" }}>
                  TODAY'S CLICK COUNT
                </span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                  Total 2,668 hits! 🚀
                </span>
              </div>
            </div>
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
