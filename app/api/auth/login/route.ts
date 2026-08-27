import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const response = NextResponse.json(
      {
        message: "Login successful",
      },
      {
        status: 200,
      }
    );

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
      data: { user, session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("LOGIN ERROR:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 401,
        }
      );
    }

    if (!user || !session) {
      return NextResponse.json(
        {
          error: "Login failed. No session created.",
        },
        {
          status: 401,
        }
      );
    }

    console.log("LOGIN SUCCESS:", user.id);
    console.log("SESSION CREATED:", !!session);

    return response;
  } catch (error: any) {
    console.error("LOGIN SERVER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong during login.",
      },
      {
        status: 500,
      }
    );
  }
}