import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    console.log(
      "========== REVIEWS API START =========="
    );

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user);
    console.log("AUTH ERROR:", authError);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const { data, error } =
      await supabase
        .from("proposal_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("id", {
          ascending: false,
        });

    if (error) {
      console.error(
        "REVIEWS DATABASE ERROR:",
        error
      );

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

    console.log(
      "REVIEWS FOUND:",
      data?.length || 0
    );

    return NextResponse.json({
      success: true,
      reviews: data || [],
    });
  } catch (error: any) {
    console.error(
      "REVIEWS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unknown server error.",
      },
      {
        status: 500,
      }
    );
  }
}