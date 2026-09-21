"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // 1. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // 2. Call Supabase Reset
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      // This is where the user will be redirected after clicking the email link
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      // 3. Show your requested success message
      setMessage("Please check your inbox or spam folder to reset your password.");
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Forgot Password</h1>
      <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
        Enter your registered email address to receive a reset link.
      </p>

      <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        />

        {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: 0 }}>{error}</p>}
        {message && <p style={{ color: "#16a34a", fontSize: "14px", margin: 0, fontWeight: "500" }}>{message}</p>}

        <button
          type="submit"
          disabled={loading || !!message}
          style={{
            padding: "12px",
            backgroundColor: (loading || message) ? "#94a3b8" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: (loading || message) ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}