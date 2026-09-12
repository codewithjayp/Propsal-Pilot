import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    // 1. Configure the subscription using your pre-made Plan ID
    const options = {
      plan_id: process.env.RAZORPAY_PRO_PLAN_ID!, 
      customer_notify: 1 as const, // Strict type assertion fixes the red underline
      total_count: 12,    // Number of billing cycles (e.g., 12 months)
    };

    // 2. Create the subscription on Razorpay's servers
    const subscription = await razorpay.subscriptions.create(options);
    
    // 3. Return the subscription details (specifically the subscription.id)
    return NextResponse.json(subscription, { status: 200 });
  } catch (error) {
    console.error("Razorpay Subscription Error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
} 