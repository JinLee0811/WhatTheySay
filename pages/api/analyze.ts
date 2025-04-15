import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios"; // Import axios

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reviews, placeId } = req.body; // Expect placeId in the request body

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: "No reviews provided" });
    }
    if (!placeId) {
      return res.status(400).json({ error: "No placeId provided" });
    }
    if (!mapsApiKey) {
      console.error("Google Maps API key is missing.");
      return res.status(500).json({ error: "Server configuration error: Maps API key missing" });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Gemini 모델 초기화
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 리뷰 텍스트 준비
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
      throw new Error("No valid JSON found in Gemini response");
    }

    const jsonText = jsonMatch[0];
    const analysis = JSON.parse(jsonText);

    // --- Fetch Place Photos from Google Maps Places API ---
    let photoUrls: string[] = [];
    try {
      const placesApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${mapsApiKey}`;
      console.log("Requesting Place Details from:", placesApiUrl); // Log the request URL

      const placesResponse = await axios.get(placesApiUrl);
      console.log("Places API Response data:", JSON.stringify(placesResponse.data, null, 2)); // Log the full response

      if (placesResponse.data.result && placesResponse.data.result.photos) {
        const photos = placesResponse.data.result.photos;
        console.log(`Found ${photos.length} photos in Places API response.`); // Log number of photos found

        // Limit to only 1 photo to strictly avoid rate limits
        photoUrls = photos.slice(0, 1).map((photo: any) => {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${mapsApiKey}`;
          console.log("Generated Photo URL:", photoUrl); // Log each generated URL
          return photoUrl;
        });
      } else {
        console.log("No photos found in Places API response for placeId:", placeId);
      }
    } catch (placesError: any) {
      console.error(
        "Error fetching place photos:",
        placesError.response
          ? JSON.stringify(placesError.response.data, null, 2)
          : placesError.message
      ); // Log detailed error
    }
    // --- End Fetch Place Photos ---

    // Add average rating and photos to the final result
    const finalResult = {
      ...analysis,
      average_rating: parseFloat(averageRating.toFixed(1)),
      photoUrls: photoUrls, // Add photo URLs
    };

    return res.status(200).json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    // Check if error is a known type before accessing properties
    let errorMessage = "Failed to analyze reviews";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return res.status(500).json({
      success: false,
      error: errorMessage, // Provide more specific error message if available
    });
  }
}
