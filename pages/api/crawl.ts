import { NextApiRequest, NextApiResponse } from "next";
import { crawlReviews } from "../../lib/crawlReviews";
import { ApiResponse, Review } from "../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Review[]>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: "URL is required" });
  }

  try {
    const reviews = await crawlReviews(url);
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Crawling error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to crawl reviews",
    });
  }
}
