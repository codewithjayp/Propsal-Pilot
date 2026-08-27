import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET ONE REVIEW
export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();

    // Get currently logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

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

    // Get review belonging to current user
    const { data, error } = await supabase
      .from("proposal_reviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Review not found.",
          },
          {
            status: 404,
          }
        );
      }

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

    return NextResponse.json({
      success: true,
      review: data,
    });
  } catch (error: any) {
    console.error("GET REVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE ONE REVIEW
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    console.log("========== DELETE REVIEW ==========");
    console.log("REVIEW ID:", id);

    const supabase = await createClient();

    // Get currently logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user?.id);

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

    // ==========================================
    // TEMPORARY DEBUGGING
    // See if the row exists AT ALL without the user_id filter
    // ==========================================
    const { data: debugData } = await supabase
      .from("proposal_reviews")
      .select("*")
      .eq("id", id);
      
    console.log("DEBUG ROW EXISTS?:", debugData);
    // ==========================================


    // Delete ONLY if this review belongs to current user
    const { data, error } = await supabase
      .from("proposal_reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      console.error("DELETE REVIEW ERROR:", error);

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

    // Review does not exist or does not belong to user
    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Review not found.",
        },
        {
          status: 404,
        }
      );
    }

    console.log("REVIEW DELETED:", data[0].id);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully.",
      review: data[0],
    });
  } catch (error: any) {
    console.error("DELETE REVIEW EXCEPTION:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Something went wrong while deleting the review.",
      },
      {
        status: 500,
      }
    );
  }
}