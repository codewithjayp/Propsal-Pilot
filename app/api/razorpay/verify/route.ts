import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 1. Extract the new subscription ID variable
    

    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, user_id } = body;

    // ADD THESE THREE LINES TO DEBUG:
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Subscription ID:", razorpay_subscription_id);
    console.log("Secret Key Used:", process.env.RAZORPAY_KEY_SECRET ? "Exists" : "Missing");
    console.log("Service Role Key Status:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded Successfully" : "MISSING OR EMPTY");

    

    // 2. Verify the Razorpay Signature (Notice the flipped order for subscriptions)
    const text = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch. Suspected tampering.");
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Update the database
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existingSub) {
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({ is_pro: true })
        .eq('user_id', user_id);
      
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('subscriptions')
        .insert([{ user_id: user_id, is_pro: true, reviews_used: 0, review_limit: 3 }]);
        
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, message: "Subscription upgraded!" });

  } catch (error: any) {
    console.error("Verification Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}