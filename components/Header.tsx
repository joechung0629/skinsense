"use client";

import Link from "next/link";
import LoginButton from "./LoginButton";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          <span className="text-xl font-bold text-skin-700">SkinSense</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-6">
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
              href="/products"
              className="text-gray-600 transition-colors hover:text-skin-600"
            >
              護膚品
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

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-3">
          <LoginButton />
          <Link
            href="/analyzer"
            className="rounded-lg bg-skin-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-skin-700"
          >
            開始分析
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-skin-600"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <ul className="flex flex-col px-4 py-4 gap-4">
            <li>
              <Link
                href="/"
                className="block text-gray-600 hover:text-skin-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                首頁
              </Link>
            </li>
            <li>
              <Link
                href="/analyzer"
                className="block text-gray-600 hover:text-skin-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                皮膚分析
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="block text-gray-600 hover:text-skin-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                護膚品
              </Link>
            </li>
            <li>
              <Link
                href="/history"
                className="block text-gray-600 hover:text-skin-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                歷史記錄
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="block text-gray-600 hover:text-skin-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                部落格
              </Link>
            </li>
            <li className="flex gap-3 pt-4 border-t">
              <LoginButton />
              <Link
                href="/analyzer"
                className="flex-1 text-center rounded-lg bg-skin-600 px-4 py-2 text-sm font-medium text-white hover:bg-skin-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                開始分析
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
