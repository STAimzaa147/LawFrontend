import { type NextRequest, NextResponse } from "next/server";

interface News {
  _id: string
  title: string
  content: string;
  image: string
  createdAt: string
  category: string
  view_count?: number
  like_count?: number
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase() || "";
  const backendUrl = process.env.BACKEND_URL;
  try {
    // Fetch all news (no search param sent to backend)
    const response = await fetch(`${backendUrl}/api/v1/news`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const res = await response.json();
    // Filter based on search keyword
    const news = res.data || res;

    if (!Array.isArray(news)) {
      throw new Error("Expected news to be an array, got: " + JSON.stringify(news));
    }

    const filteredNews = news.filter((item: News) => {
      return (
        item.title?.toLowerCase().includes(search) ||
        item.content?.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search)
      );
    });

    return NextResponse.json(filteredNews);
  } catch (error) {
     console.error("Error fetching news:", error);
    // Fallback mock news data
    const mockNews = [
      {
        _id: "1",
        title: `ข่าวกฎหมายใหม่เกี่ยวกับ${search || "คดีแพ่ง"}`,
        summary:
          "การเปลี่ยนแปลงกฎหมายที่สำคัญที่ทุกคนควรรู้ เพื่อป้องกันปัญหาทางกฎหมายในอนาคต รวมถึงการปรับปรุงขั้นตอนการดำเนินคดี",
        content: "รายละเอียดฉบับเต็มของข่าวนี้อยู่ที่นี่...",
        image: "/images/news1.jpg",
        createdAt: "2024-01-15T10:00:00Z",
        category: [search || "กฎหมาย"],
        view_count: 150,
        like_count: 20,
      },
      {
        _id: "2",
        title: `คำพิพากษาสำคัญในคดี${search || "แพ่ง"}`,
        summary:
          "ศาลฎีกาได้มีคำพิพากษาที่เป็นบรรทัดฐานสำคัญ ซึ่งจะส่งผลต่อคดีประเภทนี้ในอนาคต และเป็นแนวทางสำหรับการพิจารณาคดีที่คล้ายคลึงกัน",
        content: "คำพิพากษาฉบับเต็มสามารถอ่านได้ที่นี่...",
        image: "/images/news2.jpg",
        createdAt: "2024-01-10T14:30:00Z",
        category: [search || "คำพิพากษา"],
        view_count: 200,
        like_count: 35,
      },
      {
        _id: "3",
        title: `แนวทางปฏิบัติใหม่สำหรับ${search || "คดีแพ่ง"}`,
        summary:
          "คณะกรรมการกฎหมายได้ออกแนวทางปฏิบัติใหม่ เพื่อให้การดำเนินคดีเป็นไปอย่างรวดเร็วและมีประสิทธิภาพมากขึ้น",
        content: "แนวทางฉบับเต็มสามารถดูได้จากที่นี่...",
        image: "/images/news3.jpg",
        createdAt: "2024-01-05T09:15:00Z",
        category: [search || "แนวทางปฏิบัติ"],
        view_count: 95,
        like_count: 10,
      },
      {
        _id: "4",
        title: `สถิติคดี${search || "แพ่ง"}ในปี 2024`,
        summary:
          "รายงานสถิติการดำเนินคดีในปีที่ผ่านมา พร้อมการวิเคราะห์แนวโน้มและข้อเสนอแนะสำหรับการปรับปรุงระบบยุติธรรม",
        content: "อ่านรายงานสถิติเพิ่มเติมได้ที่นี่...",
        image: "/images/news4.jpg",
        createdAt: "2024-01-01T12:00:00Z",
        category: [search || "สถิติ"],
        view_count: 170,
        like_count: 25,
      },
    ];

    // Also filter mock data if needed
    const filteredMock = mockNews.filter((item) => {
      return (
        item.title.toLowerCase().includes(search) ||
        item.summary.toLowerCase().includes(search) ||
        item.content.toLowerCase().includes(search) ||
        item.category.some((cat) => cat.toLowerCase().includes(search))
      );
    });

    return NextResponse.json(filteredMock);
  }
}
