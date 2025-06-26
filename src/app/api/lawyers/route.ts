import { type NextRequest, NextResponse } from "next/server";

interface Lawyer {
   _id:
    | string
    | {
        _id: string; // actual ID used in the route
        name: string;
        tel: string;
        location: string;
      };
  lawfirm_name: string
  slogan: string
  summary: string
  civilCase_specialized: string[]
  criminalCase_specialized: string[]
  consultationRate: {
    min: number
    max: number
  }
  documentDeliveryRate?: {
    min?: number
    max?: number
  }
  has_law_license: boolean
  is_verified_by_council: boolean
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase() || "";
  const backendUrl = process.env.BACKEND_URL;

  try {
    // Fetch all lawyers (no search query in the request)
    const response = await fetch(`${backendUrl}/api/v1/lawyer`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch lawyers");
    }

    const res = await response.json();
    const lawyers = res.data || res;
    // Filter lawyers based on keyword match
    const filteredLawyers = lawyers.filter((lawyer: Lawyer) => {
      return (
        lawyer.slogan?.toLowerCase().includes(search) ||
        lawyer.summary?.toLowerCase().includes(search) ||
        lawyer.lawfirm_name?.toLowerCase().includes(search) ||
        lawyer.civilCase_specialized?.some((item: string) =>
          item.toLowerCase().includes(search)
        ) ||
        lawyer.criminalCase_specialized?.some((item: string) =>
          item.toLowerCase().includes(search)
        )
      );
    });

    return NextResponse.json(filteredLawyers);
  } catch (error) {
    console.error("Error fetching lawyers:", error);

    // Return mock fallback data
    const mockLawyers = [
      {
        _id: "1",
        slogan: "ให้คำปรึกษาทางกฎหมายอย่างมืออาชีพ",
        summary: "ทนายความผู้เชี่ยวชาญด้านคดีแพ่งและคดีครอบครัว",
        lawfirm_name: "สำนักงานกฎหมายใจดี",
        consultationRate: { min: 1000, max: 3000 },
        documentDeliveryRate: { min: 500, max: 1000 },
        civilCase_specialized: ["คดีแพ่ง", "คดีครอบครัว"],
        criminalCase_specialized: ["คดีฉ้อโกง"],
        has_law_license: true,
        is_verified_by_council: true,
        verificationDocs: ["doc1.pdf", "doc2.pdf"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "2",
        slogan: "ยุติธรรมสำหรับทุกคน",
        summary: "มีประสบการณ์ในคดีอาญาและแรงงานกว่า 10 ปี",
        lawfirm_name: "สำนักงานกฎหมายเก่งกาจ",
        consultationRate: { min: 1200, max: 2500 },
        documentDeliveryRate: { min: 400, max: 800 },
        civilCase_specialized: ["คดีแรงงาน"],
        criminalCase_specialized: ["คดีอาญา"],
        has_law_license: true,
        is_verified_by_council: false,
        verificationDocs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Also filter mock if `search` exists
    const filteredMock = mockLawyers.filter((lawyer) => {
      return (
        lawyer.slogan.toLowerCase().includes(search) ||
        lawyer.summary.toLowerCase().includes(search) ||
        lawyer.lawfirm_name.toLowerCase().includes(search) ||
        lawyer.civilCase_specialized.some((item) =>
          item.toLowerCase().includes(search)
        ) ||
        lawyer.criminalCase_specialized.some((item) =>
          item.toLowerCase().includes(search)
        )
      );
    });

    return NextResponse.json(filteredMock);
  }
}
