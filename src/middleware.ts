import { NextRequest, NextResponse } from "next/server";

function getAllowedOrigins(): string[] {
  const origins = process.env.CORS_ALLOWED_ORIGINS;
  if (!origins) return [];
  return origins.split(",").map((o) => o.trim()).filter(Boolean);
}

function getAllowedMethods(): string {
  return process.env.CORS_ALLOWED_METHODS || "GET,POST,OPTIONS";
}

function getAllowedHeaders(): string {
  return process.env.CORS_ALLOWED_HEADERS || "Content-Type,Authorization";
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) return false;
  return allowed.includes(origin);
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const originAllowed = isOriginAllowed(origin);

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (originAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
      response.headers.set("Access-Control-Allow-Methods", getAllowedMethods());
      response.headers.set("Access-Control-Allow-Headers", getAllowedHeaders());
      response.headers.set("Access-Control-Max-Age", "86400");
    }
    return response;
  }

  // For non-preflight requests, continue and add CORS headers to the response
  const response = NextResponse.next();
  if (originAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
    response.headers.set("Access-Control-Allow-Methods", getAllowedMethods());
    response.headers.set("Access-Control-Allow-Headers", getAllowedHeaders());
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
