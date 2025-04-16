import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

interface NicknameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (nickname: string) => void; // Callback on successful nickname update
  userId: string | null;
}

export default function NicknameSetupModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: NicknameSetupModalProps) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !nickname.trim()) {
      setError("Please enter a valid nickname.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { nickname: nickname.trim() },
      });

      if (updateError) throw updateError;

      onSuccess(nickname.trim()); // Pass the updated nickname back
      onClose(); // Close modal on success
    } catch (err: any) {
      console.error("Error updating nickname:", err);
      setError(err.message || "Failed to update nickname. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setNickname("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' aria-hidden='true' />

      {/* Modal Content */}
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <Dialog.Panel className='w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl'>
          <Dialog.Title className='text-2xl font-bold text-center text-gray-800 mb-6'>
            Set Your Nickname
          </Dialog.Title>
          <Dialog.Description className='text-sm text-center text-gray-600 mb-6'>
            Choose a nickname that will be displayed with your reviews.
          </Dialog.Description>

          <form onSubmit={handleSaveNickname} className='space-y-4'>
            <div>
              <label
                htmlFor='nickname-setup'
                className='block text-sm font-medium text-gray-700 sr-only'>
                Nickname
              </label>
              <input
                id='nickname-setup'
                type='text'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder='Enter your nickname'
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-4 text-sm'
                required
                minLength={2} // Optional: add min length
                maxLength={20} // Optional: add max length
                disabled={loading}
              />
            </div>

            {error && <p className='text-red-600 text-sm text-center pt-1'>{error}</p>}

            <button
              type='submit'
              disabled={loading || !nickname.trim()}
              className='w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed'>
              {loading ? "Saving..." : "Save Nickname"}
            </button>
          </form>
          <button
            onClick={onClose} // Add a close button
            className='mt-4 w-full text-sm text-gray-600 hover:text-gray-800 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out'
            disabled={loading}>
            Maybe Later
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
