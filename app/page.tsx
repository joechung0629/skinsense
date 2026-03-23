import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-skin-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              用 AI 了解你的
              <span className="text-skin-600">肌膚</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              上傳照片，AI 將分析您的肌膚類型、困擾，並提供個人化的護理建議和產品推薦。
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/analyzer"
                className="rounded-lg bg-skin-600 px-8 py-3 font-medium text-white transition-colors hover:bg-skin-700"
              >
                立即開始分析
              </Link>
              <Link
                href="/blog"
                className="rounded-lg border border-gray-200 px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            為什麼選擇 SkinSense
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <article className="rounded-xl bg-white p-6 text-center shadow-sm">
              <span className="mb-4 block text-4xl">🤖</span>
              <h3 className="mb-2 text-xl font-semibold">AI 智能分析</h3>
              <p className="text-gray-600">
                採用先進的 Gemini AI 模型，準確識別肌膚問題
              </p>
            </article>
            <article className="rounded-xl bg-white p-6 text-center shadow-sm">
              <span className="mb-4 block text-4xl">⚡</span>
              <h3 className="mb-2 text-xl font-semibold">快速結果</h3>
              <p className="text-gray-600">
                30 秒內獲得完整的肌膚分析報告
              </p>
            </article>
            <article className="rounded-xl bg-white p-6 text-center shadow-sm">
              <span className="mb-4 block text-4xl">🔒</span>
              <h3 className="mb-2 text-xl font-semibold">隱私保護</h3>
              <p className="text-gray-600">
                照片僅用於分析，絕不分享或用於其他用途
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-skin-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            準備好了解你的肌膚了嗎？
          </h2>
          <p className="mb-8 text-skin-100">
            免費分析，立即獲得個人化護理建議
          </p>
          <Link
            href="/analyzer"
            className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-skin-600 transition-colors hover:bg-skin-50"
          >
            開始分析
          </Link>
        </div>
      </section>
    </div>
  );
}
