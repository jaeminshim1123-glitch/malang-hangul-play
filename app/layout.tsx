import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "말랑한글: 소리숲 탐험",
  description: "5–6세 아이가 소리를 듣고 자음과 모음을 조립하며 한글을 배우는 놀이형 게임",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
