"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CreateForum() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("คำถามกฎหมาย");
  const [image, setImage] = useState<File | null>(null);
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    if (image) formData.append("image", image);

    try {
    const response = await fetch(`${backendUrl}/api/v1/forum`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`, // 👈 Include token here
      },
      body: formData,
    });

    const data = await response.json();
    console.log("Forum data : ",data);

    if (response.ok) {
      alert('สร้างกระทู้สำเร็จ!'); // Created successfully!
      setTitle('');
      setContent('');
      setCategory('คำถามกฎหมาย');
      setImage(null);
    } else {
      alert(`เกิดข้อผิดพลาด: ${data.message || 'Unknown error'}`);
    }
  } catch (err) {
    alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    console.log(err);
  }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-md p-6 my-10 shadow space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">สร้างกระทู้ใหม่</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หัวข้อกระทู้
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพ (ถ้ามี)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setImage(e.target.files[0]);
                else setImage(null);
              }}
              className="w-full text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เนื้อหา
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่
            </label>
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
            สร้างกระทู้
          </button>
        </form>
      </div>
    </main>
  );
}
