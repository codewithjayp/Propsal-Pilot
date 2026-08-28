"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Move the actual form and searchParams logic into a child component
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);

  async function login(e?: React.FormEvent) {
    if (e) e.preventDefault(); 

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      window.location.assign(redirect);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        width: "100%",
        maxWidth: "400px",
        borderRadius: "12px",
        padding: "40px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600", margin: "0 0 8px 0" }}>
          Welcome Back
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
          Sign in to your ProposalPilot account
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={login}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "6px",
            }}
          >
            Email Address
          </label>
          <input
            className="input-area"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: loading ? "#f8fafc" : "#ffffff",
              fontSize: "15px",
              transition: "all 0.2s ease",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "6px",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              className="input-area"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 40px 12px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: loading ? "#f8fafc" : "#ffffff",
                fontSize: "15px",
                transition: "all 0.2s ease",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: loading ? "not-allowed" : "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#94a3b8" : "#0f172a",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "15px",
            fontWeight: "600",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {loading && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          )}
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>
        Don't have an account?{" "}
        <button
          onClick={() => router.push("/test")}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            fontWeight: "600",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Create one
        </button>
      </div>
    </div>
  );
}

// 2. Wrap it in a Suspense boundary in the main exported page
export default function LoginTestPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
      }}
    >
      <style>{`
        .btn { transition: all 0.2s ease; }
        .btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .input-area:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      
      {/* Suspense fixes the Vercel prerender error */}
      <Suspense fallback={<div style={{ padding: "40px" }}>Loading secure login...</div>}>
        <LoginForm />
      </Suspense>
      
    </div>
  );
}