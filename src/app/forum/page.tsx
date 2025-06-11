import React from "react";
import Link from "next/link";
//import Image from "next/image";

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

async function getForums(): Promise<ForumPost[]> {
  try {
    const res = await fetch("http://localhost:5050/api/v1/forum", {
      cache: "no-store",
    });
    const data = await res.json();
    console.log(data);
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error("Error fetching forums:", error);
  }
  return [];
}

export default async function ForumPage() {
  const forums = await getForums();

  if (forums.length === 0) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-end mb-4">
          <Link
            href="/forum/create"
            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            + Add Forum
          </Link>
        </div>
        <p className="text-center mt-10 text-gray-500">No forum posts available.</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex justify-end mb-4">
        <Link
          href="/forum/create"
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          + Add Forum
        </Link>
      </div>
      <div className="space-y-10 my-10 bg-white rounded-md">
        {forums.map((forum) => (
          <article
            key={forum._id}
            className="border rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition"
          >
           {/* {forum.image ? (
            <div className="relative w-full md:w-64 h-40 rounded-md overflow-hidden flex-shrink-0">
                <Image
                src={forum.image}
                alt={forum.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 256px"
                />
            </div>
            ) : null} */}


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
        ))}
      </div>
    </main>
  );
}
