import Link from "next/link";
import HomeWeatherSection from "@/components/HomeWeatherSection";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Weather Reminder */}
      <HomeWeatherSection />
      {/* Hero - 強調不需要每天自拍 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-skin-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              「不需要每天自拍」的
              <span className="text-skin-600"> AI 皮膚管理</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              上傳照片擔心隱私？<br className="hidden sm:block" />
              SkinSense 只需要回答幾個問題 + 一張照片，<br className="hidden sm:block" />
              就能了解你的皮膚，告訴你哪些產品真正有效。
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/analyzer"
                className="rounded-lg bg-skin-600 px-8 py-3 font-medium text-white transition-colors hover:bg-skin-700"
              >
                開始了解我的皮膚
              </Link>
              <Link
                href="/products"
                className="rounded-lg border border-gray-200 px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                查看我的護膚品
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features - 3個特點卡片 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            SkinSense 的不同
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <article className="rounded-xl bg-white p-6 text-center shadow-sm border border-skin-100">
              <span className="mb-4 block text-4xl">🔒</span>
              <h3 className="mb-2 text-xl font-semibold">隱私優先</h3>
              <p className="text-gray-600">
                不需要每天自拍，不存照片
              </p>
            </article>
            <article className="rounded-xl bg-white p-6 text-center shadow-sm border border-skin-100">
              <span className="mb-4 block text-4xl">🎯</span>
              <h3 className="mb-2 text-xl font-semibold">真正了解你</h3>
              <p className="text-gray-600">
                問卷 + AI，先了解你的皮膚再推薦
              </p>
            </article>
            <article className="rounded-xl bg-white p-6 text-center shadow-sm border border-skin-100">
              <span className="mb-4 block text-4xl">📊</span>
              <h3 className="mb-2 text-xl font-semibold">知道效果</h3>
              <p className="text-gray-600">
                追蹤護膚品，知道哪些產品真正有效
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-skin-50/50">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            如何使用
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-skin-100 text-2xl font-bold text-skin-600">1</div>
              <h3 className="mb-2 font-semibold">回答問題</h3>
              <p className="text-sm text-gray-600">填寫幾個關於你皮膚的問題</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-skin-100 text-2xl font-bold text-skin-600">2</div>
              <h3 className="mb-2 font-semibold">上傳照片</h3>
              <p className="text-sm text-gray-600">上傳一張照片（可選）</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-skin-100 text-2xl font-bold text-skin-600">3</div>
              <h3 className="mb-2 font-semibold">獲得建議</h3>
              <p className="text-sm text-gray-600">AI 分析你的皮膚並推薦</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-skin-100 text-2xl font-bold text-skin-600">4</div>
              <h3 className="mb-2 font-semibold">追蹤效果</h3>
              <p className="text-sm text-gray-600">記錄護膚品，知道哪些有效</p>
            </div>
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
