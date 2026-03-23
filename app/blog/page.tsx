import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "部落格",
  description: "閱讀最新的護膚知識、肌膚保養技巧和產品評測。",
};

const posts = [
  {
    id: 1,
    title: "如何正確識別你的肌膚類型",
    excerpt: "了解自己的肌膚類型是護膚的第一步。本文將介紹五種主要肌膚類型的特徵和辨識方法。",
    date: "2026-03-15",
    category: "護膚知識",
  },
  {
    id: 2,
    title: "冬季保濕攻略：遠離乾燥脫皮",
    excerpt: "冬季氣候乾燥，肌膚容易缺水。本文提供全面的冬季保濕策略和產品推薦。",
    date: "2026-03-10",
    category: "季節護理",
  },
  {
    id: 3,
    title: "敏感肌膚的清潔與保養",
    excerpt: "敏感肌膚需要特別的呵護。這篇指南將幫助你建立溫和有效的護膚routine。",
    date: "2026-03-05",
    category: "敏感肌",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">部落格</h1>
        <p className="text-gray-600">最新的護膚知識與技巧</p>
      </header>

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="mb-2 inline-block text-xs font-medium text-skin-600">
                {post.category}
              </span>
              <h2 className="mb-2 text-xl font-semibold">
                <a href="#" className="hover:text-skin-600">
                  {post.title}
                </a>
              </h2>
              <p className="mb-4 text-gray-600">{post.excerpt}</p>
              <time className="text-sm text-gray-400">{post.date}</time>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
