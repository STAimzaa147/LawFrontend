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
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get("search")?.toLowerCase() || ""
  const min = searchParams.get("min")
  const max = searchParams.get("max")

  const backendUrl = process.env.BACKEND_URL

  try {
    let response

    // 👇 Extract Authorization header from the incoming request
    const authHeader = request.headers.get("authorization")

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // 👇 Attach the Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    if (min || max) {
      const query = new URLSearchParams()
      if (min) query.append("min", min)
      if (max) query.append("max", max)

      response = await fetch(`${backendUrl}/api/v1/lawyer/price?${query.toString()}`, {
        headers,
      })
    } else {
      response = await fetch(`${backendUrl}/api/v1/lawyer`, {
        headers,
      })
    }

    if (!response.ok) {
      throw new Error("Failed to fetch lawyers")
    }

    const res = await response.json()
    const lawyers = res.data || res

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
      )
    })

    return NextResponse.json(filteredLawyers)
  } catch (error) {
    console.error("Error fetching lawyers:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
