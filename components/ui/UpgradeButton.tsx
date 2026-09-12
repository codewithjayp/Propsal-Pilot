"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // The modern SSR browser client automatically detects your login cookies
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handlePayment = async () => {
    setLoading(true);

    // 1. Ensure Razorpay SDK is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay SDK. Please check your connection.");
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      alert("You must be logged in to upgrade.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 999 }),
      });
      
      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ProposalPilot',
        description: 'Upgrade to Pro Plan',
        subscription_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id, 
              razorpay_signature: response.razorpay_signature,
              user_id: user.id 
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
          name: 'Pro User',
          email: user.email || 'user@example.com', 
        },
        theme: {
          color: '#0f172a',
        },
      };

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
      className="btn"
      style={{
        width: "100%", 
        padding: "12px", 
        backgroundColor: loading ? "#94a3b8" : "#2563eb", 
        color: "#ffffff", 
        border: "none", 
        borderRadius: "8px", 
        fontWeight: "600", 
        fontSize: "15px", 
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {loading ? 'Opening secure checkout...' : 'Upgrade to Pro - ₹999'}
    </button>
  );
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};