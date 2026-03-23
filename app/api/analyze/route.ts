import { NextRequest, NextResponse } from "next/server";
import { analyzeSkin } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const skinHistory = formData.get("skinHistory") as string | null;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "請上傳圖片" },
        { status: 400 }
      );
    }

    // Convert to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const result = await analyzeSkin({
      imageBase64: base64,
      skinHistory: skinHistory || undefined,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { success: false, error: "分析失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
