'use client';

import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef , useState } from "react";
import { useSession } from "next-auth/react";
import CommentMenu from "@/components/CommentMenu";
import ForumPostMenu from "@/components/ForumPostMenu";


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
  const [showCommentBox, setShowCommentBox] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (showCommentBox && commentInputRef.current) {
      commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showCommentBox]);

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

    const url = editingCommentId
      ? `${backendUrl}/api/v1/forum/${params.id}/comment/${editingCommentId}`
      : `${backendUrl}/api/v1/forum/${params.id}/comment`;

    const method = editingCommentId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      setEditingCommentId(null);
      setShowCommentBox(false);

      // Refresh comments
      const commentsRes = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`);
      const data = await commentsRes.json();
      if (data.success) {
        setComments(data.comments);
      }
    } else {
      alert("Failed to post comment.");
    }
  };

  const handleEdit = (comment: Comment) => {
    setShowCommentBox(true);
    setNewComment(comment.content);
    setEditingCommentId(comment._id);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });

    if (res.ok) {
      // Refresh comments
      const commentsRes = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`);
      const data = await commentsRes.json();
      if (data.success) {
        setComments(data.comments);
      }
    } else {
      alert("Failed to delete comment.");
    }
  };

  if (!forum) return <p className="text-center p-6 my -10">Loading...</p>;

  return (
    <>
    <div className="max-w-4xl mx-auto mt-24 p-6 bg-white rounded shadow">
      <div className="relative">
        {session?.user?.id === forum.poster_id._id && (
          <div className="absolute top-0 right-0">
            <ForumPostMenu
              onEdit={() => router.push(`/forum/${forum._id}/edit`)}
              onDelete={async () => {
                const confirmed = confirm("Are you sure you want to delete this post?");
                if (!confirmed) return;

                try {
                  const res = await fetch(`${backendUrl}/api/v1/forum/${forum._id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${session?.accessToken}`,
                    },
                  });

                  if (res.ok) {
                    alert("Forum post deleted successfully.");
                    router.push("/forum"); // or wherever your forum list lives
                  } else {
                    alert("Failed to delete forum post.");
                  }
                } catch (error) {
                  console.error("Error deleting forum post:", error);
                  alert("An error occurred while deleting the forum post.");
                }
              }}
            />
          </div>
        )}

        <h1 className="text-3xl text-black font-bold mb-4">{forum.title}</h1>
      </div>
      <div className="text-gray-600 text-sm mb-2">
        Posted by {forum.poster_id.name} on {new Date(forum.createdAt).toLocaleString()}
      </div>
      <div className="text-blue-700 font-medium mb-6">{forum.category}</div>

      {forum.image && (
        <div className="relative w-full max-w-2xl h-80 mx-auto rounded-md overflow-hidden mb-6">
          <Image
            src={forum.image}
            alt={forum.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      )}

      <p className="text-gray-800 px-20 mb-10 whitespace-pre-line">{forum.content}</p>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-black font-semibold">ความคิดเห็น</h2>
          <button
            onClick={() => setShowCommentBox((prev) => !prev)}
            className="px-10 py-2 text-sm text-white bg-[#353C63]/80 rounded-3xl hover:underline"
          >
            + แสดงความคิดเห็น
          </button>
        </div>

        {comments.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีความคิดเห็น</p>
        ) : (
          <ul className="space-y-6">
            {comments.map((comment) =>
              comment && comment.content ? (
                <li key={comment._id} className="border-t pt-4 relative">
                  <p className="text-gray-800">{comment.content}</p>
                  <span className="text-xs text-gray-500 block mt-1">
                    By {comment.user_id?.name || "Unknown"} on{" "}
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>

                  {/* Menu trigger (show only for comment owner) */}
                  {session?.user?.id === comment.user_id._id && (
                    <div className="absolute top-2 right-2">
                      <CommentMenu
                        onEdit={() => handleEdit(comment)}
                        onDelete={() => handleDelete(comment._id)}
                      />
                    </div>
                  )}
                </li>
              ) : null
            )}
          </ul>
        )}
      </section>
    </div>
    {showCommentBox && (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <h3 className="text-xl font-semibold text-black mb-2">
          {editingCommentId ? "แก้ไขความคิดเห็น" : "เขียนแสดงความคิดเห็น"}
        </h3>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border rounded p-2 text-sm text-black"
            rows={4}
            placeholder="เขียนแสดงความคิดเห็นตรงนี้..."
          />
          <div className="flex justify-end mt-2 gap-2">
            {(editingCommentId || showCommentBox) && (
              <button
                type="button"
                onClick={() => {
                  setShowCommentBox(false);
                  setNewComment("");
                  setEditingCommentId(null);
                }}
                className="text-sm px-4 py-1 rounded-3xl bg-gray-300 text-black hover:bg-gray-400"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              className="text-sm px-4 py-1 rounded-3xl bg-[#353C63]/80 text-white hover:bg-green-700"
            >
              {editingCommentId ? "บันทึก" : "เพิ่ม"}
            </button>
          </div>
        </form>
      </div>
    )}
      </>
  );
}
