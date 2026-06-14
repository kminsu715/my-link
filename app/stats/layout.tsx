import { Metadata } from "next";

export const metadata: Metadata = {
  title: "링크 분석 통계",
  description: "내 프로필 링크의 실시간 분석 통계를 확인하세요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
