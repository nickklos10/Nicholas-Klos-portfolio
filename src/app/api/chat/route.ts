export const runtime = "edge";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();

  const upstream = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(req.headers.get("x-forwarded-for")
        ? { "x-forwarded-for": req.headers.get("x-forwarded-for")! }
        : {}),
    },
    body,
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "x-accel-buffering": "no",
    },
  });
}
