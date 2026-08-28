"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Create the order on your backend
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 999 }), // e.g., ₹999 for Pro Plan
      });
      
      const order = await res.json();

      // 2. Configure the Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ProposalPilot',
        description: 'Upgrade to Pro Plan',
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment success (We will build this route next)
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
             razorpay_order_id: response.razorpay_order_id,
             razorpay_payment_id: response.razorpay_payment_id,
             razorpay_signature: response.razorpay_signature,
             user_id: user.id // Pass the actual Supabase auth.uid() here
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert('Payment Successful! Welcome to Pro.');
            router.push('/dashboard');
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: 'Your User',
          email: 'user@example.com', // Pass actual logged-in user data here
        },
        theme: {
          color: '#0f172a',
        },
      };

      // 4. Open the Razorpay modal
      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error(error);
      alert('Something went wrong initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      style={{ padding: '12px 24px', backgroundColor: '#0f172a', color: 'white', borderRadius: '8px' }}
    >
      {loading ? 'Processing...' : 'Upgrade to Pro - ₹999'}
    </button>
  );
}