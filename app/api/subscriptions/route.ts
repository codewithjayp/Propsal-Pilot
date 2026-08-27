import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const USER_ID = user.id;

    // 2. Fetch their subscription data from the database
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", USER_ID);

    if (subscriptionError) {
      console.error("DB FETCH ERROR:", subscriptionError);
      return NextResponse.json(
        { error: "Failed to fetch subscription data." },
        { status: 500 }
      );
    }

    const subscription = subscriptions?.[0];

    // 3. If no record exists yet, return the default free plan values
    if (!subscription) {
      return NextResponse.json({
        reviews_used: 0,
        review_limit: 3,
        is_pro: false,
      });
    }

    // 4. Return the user's actual data
    return NextResponse.json({
      reviews_used: subscription.reviews_used || 0,
      review_limit: subscription.review_limit || 3,
      // If they have a limit higher than 3, we consider them a Pro user
      is_pro: subscription.review_limit > 3, 
    });

  } catch (error: any) {
    console.error("SUBSCRIPTION API ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}