import type { SkinAnalysisResult } from "@/lib/types";
import clsx from "clsx";

interface ResultCardProps {
  result: SkinAnalysisResult;
}

const skinTypeLabels = {
  dry: "乾性肌膚",
  oily: "油性肌膚",
  combination: "混合肌膚",
  normal: "正常肌膚",
  sensitive: "敏感肌膚",
};

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-lg">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">分析時間</p>
          <p className="text-gray-700">
            {new Date(result.createdAt).toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">皮膚健康分數</p>
          <p
            className={clsx(
              "text-3xl font-bold",
              result.score >= 80
                ? "text-green-600"
                : result.score >= 60
                ? "text-yellow-600"
                : "text-red-600"
            )}
          >
            {result.score}
          </p>
        </div>
      </header>

      {/* Skin Type */}
      <section className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">肌膚類型</h3>
        <span className="inline-block rounded-full bg-skin-100 px-4 py-2 text-skin-700">
          {skinTypeLabels[result.skinType]}
        </span>
      </section>

      {/* Concerns */}
      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">肌膚困擾</h3>
        <ul className="flex flex-wrap gap-2">
          {result.concerns.map((concern) => (
            <li
              key={concern}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {concern}
            </li>
          ))}
        </ul>
      </section>

      {/* Routine */}
      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">護理建議</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-700">☀️ 早晨</h4>
            <ol className="space-y-2">
              {result.routine.morning.map((step) => (
                <li key={step.order} className="flex gap-2 text-sm">
                  <span className="font-medium text-blue-600">
                    {step.order}.
                  </span>
                  <div>
                    <p className="text-gray-800">{step.product}</p>
                    <p className="text-gray-500">{step.purpose}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <h4 className="mb-2 font-medium text-purple-700">🌙 夜間</h4>
            <ol className="space-y-2">
              {result.routine.evening.map((step) => (
                <li key={step.order} className="flex gap-2 text-sm">
                  <span className="font-medium text-purple-600">
                    {step.order}.
                  </span>
                  <div>
                    <p className="text-gray-800">{step.product}</p>
                    <p className="text-gray-500">{step.purpose}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section>
        <h3 className="mb-3 text-lg font-semibold">推薦成分</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">成分</th>
                <th className="pb-2 font-medium">功效</th>
                <th className="pb-2 font-medium">濃度</th>
              </tr>
            </thead>
            <tbody>
              {result.ingredients.map((ing, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 font-medium">{ing.ingredient}</td>
                  <td className="py-2 text-gray-600">{ing.benefit}</td>
                  <td className="py-2 text-gray-500">
                    {ing.concentration || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
