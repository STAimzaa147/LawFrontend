'use client';

import { useState } from 'react';
import { HiShare } from 'react-icons/hi';

export default function ShareButton() {
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    if (!navigator.share) {
      setError('เบราว์เซอร์ของคุณไม่รองรับการแชร์');
      return;
    }

    try {
      await navigator.share({
        title: document.title,
        text: 'ขอเชิญอ่านข่าวนี้',
        url: window.location.href,
      });
      setError(null);
    } catch (err) {
      setError('แชร์ไม่สำเร็จ');
      console.error('Error sharing:', err);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share news"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition"
        >
        <HiShare className="h-5 w-5" /> {/* keep icon/button small */}
        <span className="text-sm font-light">แชร์</span> {/* bigger text */}
        </button>
      {error && <p className="text-red-500 text-lg mt-1">{error}</p>}
    </>
  );
}
