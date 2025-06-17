'use client';

import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ForumPost = {
  _id: string;
  poster_id: { _id: string; name: string };
  title: string;
  content: string;
  image: string;
  category: string;
  createdAt: string;
};

type Comment = {
  _id: string;
  user_id: { _id: string; name: string };
  content: string;
  createdAt: string;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ForumPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [forum, setForum] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchForum = async () => {
      const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}`);
      const data = await res.json();
      if (data.success) setForum(data.data);
      else notFound();
    };

    const fetchComments = async () => {
      const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`);
      const data = await res.json();
      if (data.comments) setComments(data.comments);
      console.log(res);
    };

    fetchForum();
    fetchComments();
  }, [params.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert("You must be logged in to comment.");
      router.push("/api/auth/signin");
      return;
    }

    if (!newComment.trim()) return;

    const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
       },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment('');

      // Re-fetch all comments to get the latest from server
      const commentsRes = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`);
      const data = await commentsRes.json();
      if (data.success) {
        setComments(data.comments);
      }
    } else {
      alert("Failed to post comment.");
    }
  };

  if (!forum) return <p className="text-center p-6">Loading...</p>;

  return (
    <main className="max-w-4xl mx-auto my-25 p-6 bg-white rounded shadow">
      <h1 className="text-3xl text-black font-bold mb-4">{forum.title}</h1>
      <div className="text-gray-600 text-sm mb-2">
        Posted by {forum.poster_id.name} on {new Date(forum.createdAt).toLocaleString()}
      </div>
      <div className="text-blue-700 font-medium mb-6">{forum.category}</div>

      {forum.image && (
        <div className="relative w-full md:w-64 h-40 rounded-md overflow-hidden flex-shrink-0 mb-6">
          <Image
            src={forum.image}
            alt={forum.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 256px"
          />
        </div>
      )}

      <p className="text-gray-800 mb-10 whitespace-pre-line">{forum.content}</p>

      <section className="mt-8">
        <h2 className="text-2xl text-black font-semibold mb-4">ความคิดเห็น</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีความคิดเห็น</p>
        ) : (
          <ul className="space-y-6">
            {comments.map((comment) =>
              comment && comment.content ? (
                <li key={comment._id} className="border-t pt-4">
                  <p className="text-gray-800">{comment.content}</p>
                  <span className="text-xs text-gray-500 block mt-1">
                    By {comment.user_id?.name || "Unknown"} on{" "}
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </li>
              ) : null
            )}
          </ul>
        )}

        {/* Add New Comment (Reply to Post) */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold text-black mb-2">เขียนแสดงความคิดเห็น</h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border rounded p-2 text-sm text-black"
              rows={4}
              placeholder="เขียนแสดงความคิดเห็นตรงนี้..."
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="text-sm px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              >
                เพิ่ม
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
