import { notFound } from "next/navigation";
import Image from "next/image";

// interface PageProps {
//   params: { id: string };
// }

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
  user_id: { _id: string; name: string };  // change here
  content: string;
  createdAt: string;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getForumById(id: string): Promise<ForumPost | null> {
  const res = await fetch(`${backendUrl}/api/v1/forum/${id}`, { cache: "no-store" });
  const data = await res.json();
  console.log("Forum data: ", data);
  return data.success ? data.data : null;
}

async function getComments(forumId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`${backendUrl}/api/v1/forum/${forumId}/comment`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch comments:", res.status);
      return [];
    }

    const data = await res.json();
    console.log("Comment Data : ", data);
    return Array.isArray(data.comments) ? data.comments : [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

const ForumPage = async ({ params }:  { params: { id: string } }) => {
  const forum = await getForumById(params.id);
  if (!forum) return notFound();

  const comments = await getComments(params.id);

  return (
    <main className="max-w-4xl mx-auto my-25 p-6 bg-white rounded shadow">
      <h1 className="text-3xl text-black font-bold mb-4">{forum.title}</h1>
      <div className="text-gray-600 text-sm mb-2">
        Posted by {forum.poster_id.name} on {new Date(forum.createdAt).toLocaleString()}
      </div>
      <div className="text-blue-700 font-medium mb-6">{forum.category}</div>
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
      <p className="text-gray-800 mb-10 whitespace-pre-line">{forum.content}</p>

      <section className="mt-8">
        <h2 className="text-2xl text-black font-semibold mb-4">Comments</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment._id} className="border-t pt-4">
                <p className="text-gray-800">{comment.content}</p>
                <span className="text-xs text-gray-500 block mt-1">
                  By {comment.user_id?.name || "Unknown"} on {new Date(comment.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default ForumPage;