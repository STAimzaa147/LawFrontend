"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ForumPostMenu from "@/components/ForumPostMenu";

type ForumPost = {
  _id: string;
  poster_id: {
    _id: string;
    name: string;
  };
  title: string;
  content: string;
  image: string;
  category: string;
  createdAt: string;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ForumPage() {
  const [forums, setForums] = useState<ForumPost[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/forum`, {
          cache: "no-store",
        });
        const data = await res.json();
        console.log("Forum Data : ", data);
        if (data.success) {
          setForums(data.data);
        }
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    fetchForums();
  }, []);

  const handleAddForumClick = () => {
    if (session?.user) {
      router.push("/forum/create");
    } else {
      alert("You must be logged in to add a forum.");
      router.push("/api/auth/signin");
    }
  };

  const handleDeleteForum = async (forumId: string) => {
    const confirmed = confirm("Are you sure you want to delete this forum?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${backendUrl}/api/v1/forum/${forumId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (res.ok) {
        setForums((prev) => prev.filter((f) => f._id !== forumId));
      } else {
        alert("Failed to delete forum.");
      }
    } catch (error) {
      console.error("Error deleting forum:", error);
      alert("An error occurred while deleting the forum.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddForumClick}
          className="bg-white text-black px-4 py-2 rounded-3xl hover:bg-gray-300 transition"
        >
          + เพิ่มกระทู้
        </button>
      </div>

      {forums.length === 0 ? (
        <p className="text-center mt-10 text-gray-500">No forum posts available.</p>
      ) : (
        <div className="space-y-5 my-10 rounded-md">
          {forums.map((forum) => (
            <div key={forum._id} className="relative">
              {session?.user && session.user.id === forum.poster_id._id && (
                <div className="absolute top-2 right-2">
                  <ForumPostMenu
                    onEdit={() => router.push(`/forum/${forum._id}/edit`)} // Adjust edit route if you have one
                    onDelete={() => handleDeleteForum(forum._id)}
                  />
                </div>
              )}

              <Link href={`/forum/${forum._id}`} className="block">
                <article className="bg-white border rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition cursor-pointer">
                  {forum.image && (
                    <div className="relative w-full md:w-64 h-40 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={forum.image}
                        alt={forum.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 256px"
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{forum.title}</h2>
                      <p className="text-gray-700 line-clamp-3 mb-4">{forum.content}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
                      <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {forum.category}
                      </span>
                      <span>
                        Posted by {forum.poster_id?.name || "Unknown"} on{" "}
                        {new Date(forum.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
