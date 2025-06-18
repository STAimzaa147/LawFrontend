"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditForum() {
  const { id } = useParams(); // forum post ID from the URL
  const router = useRouter();
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("คำถามกฎหมาย");
  const [image, setImage] = useState<File | null>(null);

  // 1. Fetch existing forum post data
  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`${backendUrl}/api/v1/forum/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTitle(data.data.title);
        setContent(data.data.content);
        setCategory(data.data.category);
      } else {
        alert("ไม่พบกระทู้");
        router.push("/forum");
      }
    };
    fetchPost();
  }, [id, backendUrl, router]);

  // 2. Submit updated post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let response;

    if (image) {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("image", image);

      response = await fetch(`${backendUrl}/api/v1/forum/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: formData,
      });
    } else {
      response = await fetch(`${backendUrl}/api/v1/forum/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ title, content, category }),
      });
    }

    const result = await response.json();
    if (response.ok) {
      alert("แก้ไขกระทู้สำเร็จ!");
      router.push(`/forum/${id}`);
    } else {
      alert(`เกิดข้อผิดพลาด: ${result.message || "Unknown error"}`);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-md p-6 my-10 shadow space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">แก้ไขกระทู้</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อกระทู้</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพ (อัปโหลดใหม่หากต้องการเปลี่ยน)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหา</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-black border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="คำถามกฎหมาย">คำถามกฎหมาย</option>
              <option value="คำปรึกษาทั่วไป">คำปรึกษาทั่วไป</option>
              <option value="ประสบการณ์ผู้ใช้">ประสบการณ์ผู้ใช้</option>
              <option value="ข่าวสารกฎหมาย">ข่าวสารกฎหมาย</option>
              <option value="กิจกรรมและสัมมนา">กิจกรรมและสัมมนา</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#353C63] text-white px-4 py-2 rounded hover:bg-blue-900 transition"
          >
            บันทึกการแก้ไข
          </button>
        </form>
      </div>
    </main>
  );
}
