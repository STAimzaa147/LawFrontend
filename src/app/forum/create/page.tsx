"use client";

import { useState } from "react";

export default function CreateForum() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("คำถามกฎหมาย");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // You would send a POST request to your backend here
    console.log({ title, content, category });
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
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
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
              className="w-full border border-gray-300 rounded px-3 py-2"
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
