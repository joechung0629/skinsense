import type { Metadata } from "next";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { AuthProvider } from "@/app/providers/AuthProvider";
import ChatbotWrapper from "@/components/ChatbotWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SkinSense - AI 智能皮膚分析",
    template: "%s | SkinSense",
  },
  description:
    "使用 AI 技術分析您的肌膚類型，提供個人化的護理建議和產品推薦。專業、快速、準確的皮膚檢測服務。",
  keywords: ["皮膚分析", "AI護膚", "肌膚檢測", "護膚建議", "護膚品推薦"],
  authors: [{ name: "SkinSense Team" }],
  creator: "SkinSense",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "SkinSense",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SkinSense",
    description:
      "AI 智能皮膚分析工具，提供個人化的護理建議和產品推薦",
    url: "https://skinsense.app",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="zh-TW">
      <body className="min-h-screen">
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <ChatbotWrapper />
          <footer className="border-t bg-gray-50 py-8">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
              <p>© 2026 SkinSense. All rights reserved.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
