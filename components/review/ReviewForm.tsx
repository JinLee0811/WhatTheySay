import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";

interface ReviewFormProps {
  placeId: string;
  restaurantName: string;
  onAuthRequired: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({
  placeId,
  restaurantName,
  onAuthRequired,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<{
    id: string;
    content: string;
    rating: number;
  } | null>(null);

  useEffect(() => {
    checkAuth();
    if (userId) {
      checkExistingReview();
    }
  }, [userId, placeId]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const checkExistingReview = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("id, content, rating")
      .eq("user_id", userId)
      .eq("place_id", placeId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking existing review:", error);
      return;
    }

    if (data) {
      setExistingReview(data);
      setContent(data.content);
      setRating(data.rating);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      onAuthRequired();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (existingReview) {
        const { error } = await supabase.from("reviews").delete().eq("id", existingReview.id);

        if (error) throw error;
      }

      const { error } = await supabase.from("reviews").insert([
        {
          user_id: userId,
          place_id: placeId,
          restaurant_name: restaurantName,
          content,
          rating,
        },
      ]);

      if (error) throw error;

      setContent("");
      setRating(5);
      setExistingReview(null);
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label htmlFor='content' className='block text-sm font-medium text-gray-700 mb-1'>
          Your Review
        </label>
        <textarea
          id='content'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          rows={3}
          required
          placeholder='Share your experience...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Rating</label>
        <div className='flex gap-1'>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type='button'
              onClick={() => setRating(value)}
              className='focus:outline-none'>
              <StarIcon
                className={`w-6 h-6 ${value <= rating ? "text-yellow-400" : "text-gray-300"}`}
              />
            </button>
          ))}
        </div>
      </div>

      {error && <div className='text-red-600 text-sm'>{error}</div>}

      <button
        type='submit'
        disabled={loading}
        className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
        {loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}
