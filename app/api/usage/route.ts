import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const USER_ID = user.id;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", USER_ID);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    const subscription = data?.[0];

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      userId: USER_ID,
      subscription,
    });
  } catch (error: any) {
    console.error("USAGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message || "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}