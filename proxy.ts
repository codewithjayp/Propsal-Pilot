import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/dashboard/reviews",
    "/analyze",
    "/analyze-test",
  ];

  const isProtectedRoute =
    protectedRoutes.some((route) =>
      pathname === route ||
      pathname.startsWith(route + "/")
    );

  console.log(
    "PROXY:",
    pathname,
    "USER:",
    user ? user.id : "NOT LOGGED IN"
  );

  if (isProtectedRoute && !user) {
    console.log(
      "PROXY REDIRECT:",
      pathname
    );

    const loginUrl = new URL(
      "/login-test",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analyze/:path*",
    "/analyze-test/:path*",
  ],
};