"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();

  // State for user's current subscription details
  const [loading, setLoading] = useState(true);
  const [reviewsUsed, setReviewsUsed] = useState(0);
  const [reviewLimit, setReviewLimit] = useState(3);
  const [isPro, setIsPro] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  // Handle scroll position for the "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
      // Changed from 300 to 10 so it appears immediately upon scrolling
      if (window.scrollY > 10) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  async function fetchSubscriptionData() {
    try {
      setLoading(true);
      // TODO: We will replace this with a real fetch to your future /api/subscription endpoint
      // const res = await fetch("/api/subscription");
      // const data = await res.json();
      
      // Mocking the data for now so you can see the UI
      setTimeout(() => {
        setReviewsUsed(1); // Change this number to test the progress bar
        setReviewLimit(3);
        setIsPro(false);
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error("Failed to load subscription data");
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    showToast("Payment integration coming soon!", "success");
    // TODO: Integrate Stripe or Lemon Squeezy checkout session here
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
      }}
    >
      {/* INJECT STYLES */}
      <style>{`
        .btn { transition: all 0.2s ease; }
        .btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background-color: #e2e8f0;
          border-radius: 4px;
        }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: toast.type === "success" ? "#166534" : "#991b1b",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
            fontSize: "14px",
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px 0" }}>Plans & Billing</h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>Manage your subscription and review limits.</p>
          </div>
          <button
            className="btn"
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ffffff",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Usage Overview Card */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "32px", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 20px 0" }}>Current Usage</h2>
          
          {loading ? (
            <div>
              <div className="skeleton" style={{ height: "24px", width: "150px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "12px", width: "100%", borderRadius: "100px" }} />
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "15px" }}>
                <span style={{ color: "#334155", fontWeight: "500" }}>Proposals Analyzed</span>
                <span style={{ fontWeight: "600", color: isPro ? "#16a34a" : (reviewsUsed >= reviewLimit ? "#dc2626" : "#0f172a") }}>
                  {isPro ? "Unlimited" : `${reviewsUsed} / ${reviewLimit}`}
                </span>
              </div>
              
              {/* Progress Bar */}
              {!isPro && (
                <div style={{ width: "100%", height: "12px", backgroundColor: "#f1f5f9", borderRadius: "100px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      backgroundColor: reviewsUsed >= reviewLimit ? "#ef4444" : "#2563eb",
                      width: `${Math.min((reviewsUsed / reviewLimit) * 100, 100)}%`,
                      transition: "width 0.5s ease-in-out"
                    }} 
                  />
                </div>
              )}
              
              {!isPro && reviewsUsed >= reviewLimit && (
                <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "12px", fontWeight: "500" }}>
                  You have reached your free limit. Upgrade to Pro to continue analyzing proposals.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pricing Tiers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          
          {/* Free Plan */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0" }}>Free Plan</h3>
            <div style={{ fontSize: "36px", fontWeight: "700", marginBottom: "24px" }}>
              $0<span style={{ fontSize: "16px", color: "#64748b", fontWeight: "400" }}>/forever</span>
            </div>
            
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, color: "#334155", fontSize: "15px", lineHeight: "2" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                3 Free AI Reviews
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Basic Text Analysis
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                PDF Export
              </li>
            </ul>

            <button
              disabled={true}
              style={{
                width: "100%", padding: "12px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", fontSize: "15px", cursor: "not-allowed"
              }}
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{ backgroundColor: "#ffffff", border: "2px solid #2563eb", borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.1)" }}>
            <div style={{ position: "absolute", top: "-12px", right: "32px", backgroundColor: "#2563eb", color: "white", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Recommended
            </div>
            
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0", color: "#2563eb" }}>Pro Plan</h3>
            <div style={{ fontSize: "36px", fontWeight: "700", marginBottom: "24px" }}>
              $19<span style={{ fontSize: "16px", color: "#64748b", fontWeight: "400" }}>/month</span>
            </div>
            
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, color: "#334155", fontSize: "15px", lineHeight: "2" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <strong>Unlimited AI Reviews</strong>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                PDF Document Extraction
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Priority Groq AI Processing
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Premium PDF Reports
              </li>
            </ul>

            <button
              className="btn"
              onClick={handleUpgrade}
              style={{
                width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "15px", cursor: "pointer"
              }}
            >
              Upgrade to Pro
            </button>
          </div>

        </div>
      </div>

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn"
          style={{
            position: "fixed",
            bottom: "40px",
            right: "24px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            zIndex: 999,
          }}
          title="Scroll to top"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}