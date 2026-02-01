import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStateProvider } from "@/state/store";

export const metadata: Metadata = {
  title: "房间规划器",
  description: "房间布局规划与家具适配校验",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
