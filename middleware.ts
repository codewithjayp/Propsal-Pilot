// middleware.ts (at the root of your project)
import { proxy } from "./proxy"; // Adjust path if proxy.ts is inside a folder

export async function middleware(request: any) {
  return await proxy(request);
}

// You MUST define the matcher here, Next.js won't read it from proxy.ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analyze/:path*",
    "/analyze-test/:path*",
    "/subscription/:path*",
  ],
};