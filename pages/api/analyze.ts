import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: "No reviews provided" });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Gemini 모델 초기화
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated model name

    // 리뷰 텍스트 준비 (별점 제외 가능)
    const reviewText = reviews.map((review: any) => `Review: ${review.text}`).join("\n\n");

    // 프롬프트 생성
    const prompt = `You are a JSON-only response bot. Analyze the following Google reviews for a restaurant in Sydney and respond ONLY with a valid JSON object in the exact format specified below. Do not include any other text, explanations, or markdown formatting.

Reviews:
${reviewText}

Required JSON format (respond with ONLY this JSON structure):
{
  "sentiment": "positive/negative/mixed",
  "positive_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "negative_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "summary": "3-line summary",
  "mentioned_menu_items": ["item1", "item2", "item3"],
  "recommended_dishes": ["dish1", "dish2", "dish3"]
}`;

    // Gemini API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 응답에서 JSON 부분만 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const jsonText = jsonMatch[0];
    const analysis = JSON.parse(jsonText);

    // Add average rating to the final result
    const finalResult = {
      ...analysis,
      average_rating: parseFloat(averageRating.toFixed(1)), // Add average rating, formatted to one decimal place
    };

    return res.status(200).json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to analyze reviews",
    });
  }
}
