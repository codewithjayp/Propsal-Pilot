import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    console.log("REGISTER API HIT");

    const body = await req.json();

    const { email, password } = body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create free subscription
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: data.user?.id,
          plan_name: "Free",
          status: "active",
        },
      ]);

    console.log("USER ID:", data.user?.id);
    console.log("SUBSCRIPTION ERROR:", subscriptionError);

    return NextResponse.json({
      success: true,
      user: data.user,
      subscriptionError,
    });

  } catch (err: any) {
    console.log("FULL ERROR:", err);

    return NextResponse.json(
      {
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
