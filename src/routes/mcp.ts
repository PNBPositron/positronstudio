import { createFileRoute } from "@tanstack/react-router";

// MCP is disabled in the Vercel web build because its Cloudflare-only runtime
// dependency cannot be bundled by Nitro. The route remains registered so old
// links resolve instead of failing the application build.
export const Route = createFileRoute("/mcp")({});
