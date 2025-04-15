import { Review } from "../types";

export function buildAnalysisPrompt(reviews: Review[]): string {
  const reviewsText = reviews
    .map((review) => `평점: ${review.rating}/5\n리뷰: ${review.text}\n`)
    .join("\n---\n\n");

  return `다음 고객 리뷰들을 분석해주세요:

${reviewsText}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "sentiment": "positive" | "negative" | "mixed",
  "positive_keywords": ["키워드1", "키워드2", ...],
  "negative_keywords": ["키워드1", "키워드2", ...],
  "summary": "전체 리뷰에 대한 한 문단 요약"
}`;
}
