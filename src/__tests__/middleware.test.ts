import { describe, it, expect, beforeEach, vi } from "vitest";
import { middleware, isOriginAllowed, getMaxAge } from "../middleware";
import { NextRequest } from "next/server";

function makeRequest(origin: string | null, method = "GET"): NextRequest {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  return new NextRequest(new URL("http://localhost:3000/api/test"), {
    method,
    headers,
  });
}

describe("isOriginAllowed", () => {
  beforeEach(() => {
    delete process.env.CORS_ALLOWED_ORIGINS;
  });

  it("rejects when no origins configured", () => {
    expect(isOriginAllowed("https://evil.com")).toBe(false);
  });

  it("matches exact origin", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://example.com";
    expect(isOriginAllowed("https://example.com")).toBe(true);
    expect(isOriginAllowed("https://other.com")).toBe(false);
  });

  it("allows all origins with wildcard *", () => {
    process.env.CORS_ALLOWED_ORIGINS = "*";
    expect(isOriginAllowed("https://anything.com")).toBe(true);
  });

  it("matches subdomain wildcard *.example.com", () => {
    process.env.CORS_ALLOWED_ORIGINS = "*.example.com";
    expect(isOriginAllowed("https://app.example.com")).toBe(true);
    expect(isOriginAllowed("https://deep.sub.example.com")).toBe(true);
    expect(isOriginAllowed("https://example.com")).toBe(true);
    expect(isOriginAllowed("https://evil.com")).toBe(false);
  });

  it("rejects null origin", () => {
    process.env.CORS_ALLOWED_ORIGINS = "*";
    expect(isOriginAllowed(null)).toBe(false);
  });
});

describe("middleware", () => {
  beforeEach(() => {
    delete process.env.CORS_ALLOWED_ORIGINS;
    delete process.env.CORS_MAX_AGE;
  });

  it("returns 204 for preflight with allowed origin", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://example.com";
    const res = middleware(makeRequest("https://example.com", "OPTIONS"));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });

  it("does not set CORS headers for rejected origin", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://example.com";
    const res = middleware(makeRequest("https://evil.com"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("uses configurable max-age", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://example.com";
    process.env.CORS_MAX_AGE = "3600";
    const res = middleware(makeRequest("https://example.com", "OPTIONS"));
    expect(res.headers.get("Access-Control-Max-Age")).toBe("3600");
  });

  it("reflects request origin when wildcard * is configured", () => {
    process.env.CORS_ALLOWED_ORIGINS = "*";
    const res = middleware(makeRequest("https://any.com"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://any.com");
  });
});
