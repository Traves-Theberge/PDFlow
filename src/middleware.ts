import { NextRequest, NextResponse } from "next/server";

export function getAllowedOrigins(): string[] {
  const origins = process.env.CORS_ALLOWED_ORIGINS;
  if (!origins) return [];
  return origins.split(",").map((o) => o.trim()).filter(Boolean);
}

export function getAllowedMethods(): string {
  return process.env.CORS_ALLOWED_METHODS || "GET,POST,OPTIONS";
}

export function getAllowedHeaders(): string {
  return process.env.CORS_ALLOWED_HEADERS || "Content-Type,Authorization";
}

export function getMaxAge(): string {
  return process.env.CORS_MAX_AGE || "86400";
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) return false;

  for (const pattern of allowed) {
    if (pattern === "*") return true;
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1); // e.g. ".example.com"
      try {
        const { hostname } = new URL(origin);
        if (hostname.endsWith(suffix) || hostname === suffix.slice(1)) return true;
      } catch {
        continue;
      }
    }
    if (pattern === origin) return true;
  }
  return false;
}

function corsOriginValue(origin: string | null): string {
  const allowed = getAllowedOrigins();
  if (allowed.length === 1 && allowed[0] === "*" && !origin) return "*";
  if (allowed.length === 1 && allowed[0] === "*") return origin!;
  return origin!;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const originAllowed = isOriginAllowed(origin);

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (originAllowed) {
      response.headers.set("Access-Control-Allow-Origin", corsOriginValue(origin));
      response.headers.set("Access-Control-Allow-Methods", getAllowedMethods());
      response.headers.set("Access-Control-Allow-Headers", getAllowedHeaders());
      response.headers.set("Access-Control-Max-Age", getMaxAge());
    }
    return response;
  }

  // For non-preflight requests, continue and add CORS headers to the response
  const response = NextResponse.next();
  if (originAllowed) {
    response.headers.set("Access-Control-Allow-Origin", corsOriginValue(origin));
    response.headers.set("Access-Control-Allow-Methods", getAllowedMethods());
    response.headers.set("Access-Control-Allow-Headers", getAllowedHeaders());
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
