import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { StarIcon } from "@heroicons/react/24/solid";
import { BookmarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import AuthModal from "../components/auth/AuthModal";

interface Bookmark {
  id: string;
  place_id: string;
  restaurant_name: string;
  created_at: string;
}

interface Review {
  id: string;
  place_id: string;
  restaurant_name: string;
  content: string;
  rating: number;
  created_at: string;
}

export default function MyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }
    setUserId(user.id);
    fetchUserData(user.id);
  };

  const fetchUserData = async (userId: string) => {
    try {
      const [bookmarksResponse, reviewsResponse] = await Promise.all([
        supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (bookmarksResponse.error) throw bookmarksResponse.error;
      if (reviewsResponse.error) throw reviewsResponse.error;

      setBookmarks(bookmarksResponse.data);
      setReviews(reviewsResponse.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            <p className='mt-4 text-gray-600'>Loading your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>My Page</h1>
          <button
            onClick={handleSignOut}
            className='px-4 py-2 text-sm text-red-600 hover:text-red-800'>
            Sign Out
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Bookmarks Section */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-4 flex items-center'>
              <BookmarkIcon className='w-6 h-6 mr-2 text-blue-600' />
              My Bookmarks
            </h2>
            {bookmarks.length === 0 ? (
              <p className='text-gray-500'>No bookmarks yet.</p>
            ) : (
              <div className='space-y-4'>
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                    <div>
                      <h3 className='font-medium'>{bookmark.restaurant_name}</h3>
                      <p className='text-sm text-gray-500'>
                        {new Date(bookmark.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/restaurant/${bookmark.place_id}`)}
                      className='text-blue-600 hover:text-blue-800'>
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-4 flex items-center'>
              <PencilIcon className='w-6 h-6 mr-2 text-green-600' />
              My Reviews
            </h2>
            {reviews.length === 0 ? (
              <p className='text-gray-500'>No reviews yet.</p>
            ) : (
              <div className='space-y-4'>
                {reviews.map((review) => (
                  <div key={review.id} className='p-4 bg-gray-50 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-medium'>{review.restaurant_name}</h3>
                      <div className='flex items-center'>
                        <StarIcon className='w-5 h-5 text-yellow-400' />
                        <span className='ml-1 text-sm'>{review.rating}</span>
                      </div>
                    </div>
                    <p className='text-gray-600 mb-2'>{review.content}</p>
                    <div className='flex justify-between items-center text-sm text-gray-500'>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => router.push(`/restaurant/${review.place_id}`)}
                        className='text-blue-600 hover:text-blue-800'>
                        View Restaurant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          checkAuth();
        }}
      />
    </div>
  );
}
