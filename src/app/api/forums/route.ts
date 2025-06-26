import { type NextRequest, NextResponse } from "next/server";

interface Forum {
  _id: string
  title: string
  content: string
  image: string
  poster_id: {
    name: string
  }
  createdAt: string
  comment_count: number
  category: string
  view_count: number
  like_count: number
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase() || "";
  const backendUrl = process.env.BACKEND_URL;

  try {
    // 1. Fetch all forums without search param
    const response = await fetch(`${backendUrl}/api/v1/forum`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch forums");
    }

    const res = await response.json();
    const forums = res.data || res
    // 2. Filter forums manually
    const filteredForums = forums.filter((forum: Forum) => {
      return (
        forum.title?.toLowerCase().includes(search) ||
        forum.content?.toLowerCase().includes(search) ||
        forum.category?.toLowerCase().includes(search) ||
        forum.poster_id?.name?.toLowerCase().includes(search)
      );
    });
    console.log(filteredForums);
    return NextResponse.json(filteredForums);
  } catch (error) {
    console.error("Error fetching forums:", error);

    // Return mock forum data as fallback
    const mockForums = [
      {
        _id: "1",
        poster_id: {
          _id: "user1",
          name: "สมชาย123",
        },
        title: `ปรึกษาเรื่อง${search || "คดีแพ่ง"} - ต้องการคำแนะนำ`,
        content:
          "สวัสดีครับ ผมมีปัญหาเกี่ยวกับเรื่องนี้ และต้องการคำแนะนำจากผู้เชี่ยวชาญ หรือคนที่เคยเจอปัญหาแบบนี้มาก่อน ใครมีประสบการณ์ช่วยแนะนำหน่อยครับ",
        image: "/images/forum1.jpg",
        category: search || "คำปรึกษา",
        createdAt: "2024-01-12T09:15:00Z",
        comment_count: 5,
        like_count: 12,
        view_count: 123,
      },
      // ... (same mock items)
    ];

    return NextResponse.json(mockForums);
  }
}
