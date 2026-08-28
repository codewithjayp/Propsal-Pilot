import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Use the Service Role Key to safely bypass RLS for payment updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id } = await request.json();

    // 1. Recreate the signature on the server using Node's crypto module
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    // 2. Compare the signatures to guarantee authenticity
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // 3. Upgrade the user's subscription status in Supabase
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ is_pro: true })
      .eq('user_id', user_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}