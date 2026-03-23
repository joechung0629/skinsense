"use client";

import Link from "next/link";
import LoginButton from "./LoginButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          <span className="text-xl font-bold text-skin-700">SkinSense</span>
        </Link>

        <ul className="flex gap-6">
          <li>
            <Link
              href="/"
              className="text-gray-600 transition-colors hover:text-skin-600"
            >
              首頁
            </Link>
          </li>
          <li>
            <Link
              href="/analyzer"
              className="text-gray-600 transition-colors hover:text-skin-600"
            >
              皮膚分析
            </Link>
          </li>
          <li>
            <Link
              href="/history"
              className="text-gray-600 transition-colors hover:text-skin-600"
            >
              歷史記錄
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="text-gray-600 transition-colors hover:text-skin-600"
            >
              部落格
            </Link>
          </li>
        </ul>

        <div className="flex gap-3">
          <LoginButton />
          <Link
            href="/analyzer"
            className="rounded-lg bg-skin-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-skin-700"
          >
            開始分析
          </Link>
        </div>
      </nav>
    </header>
  );
}
