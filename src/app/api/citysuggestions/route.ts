import { NextResponse } from "next/server";

const cities = [
  "New York, NY, USA",
  "Los Angeles, CA, USA",
  "Chicago, IL, USA",
  "Houston, TX, USA",
  "Phoenix, AZ, USA",
  "Philadelphia, PA, USA",
  "San Antonio, TX, USA",
  "San Diego, CA, USA",
  "Dallas, TX, USA",
  "San Jose, CA, USA",
  "Seattle, WA, USA",
  "San Francisco, CA, USA",
  "Austin, TX, USA",
  "Denver, CO, USA",
  "Washington, DC, USA",
  "Boston, MA, USA",
  "Miami, FL, USA",
  "Atlanta, GA, USA",
  "Las Vegas, NV, USA",
  "Portland, OR, USA",
];

function getCitySuggestions(query: string): string[] {
  return cities.filter((city) =>
    city.toLowerCase().includes(query.toLowerCase())
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const suggestions = getCitySuggestions(query);
  return NextResponse.json(suggestions);
}
