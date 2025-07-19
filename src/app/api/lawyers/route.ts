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
    const headers = {
      "Content-Type": "application/json",
    }

    if (min || max) {
      // Fetch from protected /price route
      const query = new URLSearchParams()
      console.log("query : ", query);
      if (min) query.append("min", min)
      if (max) query.append("max", max)

      response = await fetch(`${backendUrl}/api/v1/lawyer/price?${query.toString()}`, {
        headers,
      })
      console.log("filter by price : ",response);
      console.log("min : ",min);
      console.log("max price : ",max);
    } else {
      // Fetch all lawyers
      response = await fetch(`${backendUrl}/api/v1/lawyer`, {
        headers,
      })
      console.log("normal filter : ",response);
    }

    if (!response.ok) {
      throw new Error("Failed to fetch lawyers")
    }

    const res = await response.json()
    const lawyers = res.data || res

    // Always apply keyword filtering after price filtering
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
