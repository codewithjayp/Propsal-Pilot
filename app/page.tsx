"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState("");

  // Handle scroll position for the "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
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

  function handleProtectedAction(route: string) {
    setPendingRoute(route);
    setAuthModalOpen(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* INJECT ANIMATION & HOVER STYLES */}
      <style>{`
        .nav-link { color: #64748b; font-weight: 500; font-size: 14px; text-decoration: none; transition: color 0.2s ease; }
        .nav-link:hover { color: #0f172a; }
        .feature-card { transition: all 0.3s ease; border: 1px solid #e2e8f0; background-color: #ffffff; }
        .feature-card:hover { transform: translateY(-5px); border-color: #2563eb; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.1); }
        .btn { transition: all 0.2s ease; }
        .btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .hero-bg {
          background: linear-gradient(180deg, #f0f4f8 0%, #f8fafc 100%);
        }
      `}</style>

      {/* TOP NAVIGATION BAR (SaaS Style with Hub Links) */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e2e8f0" }}>
        
        {/* Logo */}
        <div style={{ fontSize: "20px", fontWeight: "700", color: "#2563eb", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          ProposalPilot
        </div>

        {/* Developer/App Hub Links */}
        <div style={{ display: "none", gap: "24px", alignItems: "center", '@media (min-width: 768px)': { display: 'flex' } } as any}>
          <button onClick={() => handleProtectedAction("/dashboard")} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Dashboard</button>
          <button onClick={() => handleProtectedAction("/analyze-test")} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>New Analysis</button>
          <button onClick={() => handleProtectedAction("/history")} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>History</button>
          <button onClick={() => handleProtectedAction("/subscription")} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>Pricing</button>
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/login-test" style={{ textDecoration: "none" }}>
            <button className="btn" style={{ padding: "8px 16px", backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
              Sign In
            </button>
          </Link>
          <Link href="/test" style={{ textDecoration: "none" }}>
            <button className="btn" style={{ padding: "8px 16px", backgroundColor: "#0f172a", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="hero-bg" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
        <span style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "6px 12px", borderRadius: "100px", fontSize: "13px", fontWeight: "600", marginBottom: "24px", letterSpacing: "0.5px" }}>
          ProposalPilot AI v1.0 is now live
        </span>
        <h1 style={{ fontSize: "56px", fontWeight: "800", margin: "0 0 24px 0", maxWidth: "900px", lineHeight: "1.1", letterSpacing: "-0.03em", color: "#0f172a" }}>
          Win more clients with <span style={{ color: "#2563eb" }}>AI-powered</span> proposal auditing.
        </h1>
        <p style={{ fontSize: "20px", color: "#475569", margin: "0 0 40px 0", maxWidth: "650px", lineHeight: "1.6" }}>
          Upload your business pitches, grant applications, or freelance proposals. Our Groq-powered AI will instantly review, score, and help you improve them before you hit send.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <button 
            className="btn" 
            onClick={() => handleProtectedAction("/analyze-test")}
            style={{ padding: "16px 32px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "600", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" }}
          >
            Analyze a Proposal
          </button>
          
          <button 
            className="btn" 
            onClick={() => handleProtectedAction("/dashboard")}
            style={{ padding: "16px 32px", backgroundColor: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}
          >
            View Dashboard
          </button>
        </div>
      </div>

      {/* WHAT CAN THE PROJECT DO? (Features Section) */}
      <div style={{ backgroundColor: "#ffffff", padding: "80px 20px", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 16px 0", color: "#0f172a" }}>Everything you need to perfect your pitch</h2>
            <p style={{ color: "#64748b", fontSize: "18px", margin: 0, maxWidth: "600px", marginInline: "auto" }}>
              ProposalPilot gives you enterprise-grade feedback on your documents in seconds.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
            
            {/* Feature 1 */}
            <div className="feature-card" style={{ padding: "32px", borderRadius: "16px" }}>
              <div style={{ backgroundColor: "#dbeafe", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#0f172a" }}>Advanced AI Auditing</h3>
              <p style={{ margin: 0, color: "#64748b", lineHeight: "1.6", fontSize: "15px" }}>
                Powered by Groq's high-speed Llama models, we analyze your proposals for clarity, risk, completeness, and budget feasibility.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card" style={{ padding: "32px", borderRadius: "16px" }}>
              <div style={{ backgroundColor: "#dcfce7", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#0f172a" }}>Native PDF Extraction</h3>
              <p style={{ margin: 0, color: "#64748b", lineHeight: "1.6", fontSize: "15px" }}>
                No need to copy and paste. Upload your multi-page PDF documents directly, and we handle the text extraction automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card" style={{ padding: "32px", borderRadius: "16px" }}>
              <div style={{ backgroundColor: "#f3e8ff", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#0f172a" }}>Review Management</h3>
              <p style={{ margin: 0, color: "#64748b", lineHeight: "1.6", fontSize: "15px" }}>
                Securely store your audits in a private Supabase database. Use your dashboard and history table to search and organize past reviews.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card" style={{ padding: "32px", borderRadius: "16px" }}>
              <div style={{ backgroundColor: "#ffedd5", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 12px 0", color: "#0f172a" }}>Professional PDF Export</h3>
              <p style={{ margin: 0, color: "#64748b", lineHeight: "1.6", fontSize: "15px" }}>
                Generate client-ready, multi-page PDF reports containing the original proposal text alongside the AI-generated strengths and weaknesses.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#0f172a", color: "#94a3b8", padding: "30px 20px", textAlign: "center", fontSize: "14px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>© {new Date().getFullYear()} ProposalPilot AI. All rights reserved.</div>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/subscription" style={{ color: "#94a3b8", textDecoration: "none" }}>Pricing</Link>
            <Link href="/login-test" style={{ color: "#94a3b8", textDecoration: "none" }}>Sign In</Link>
          </div>
        </div>
      </footer>

      {/* AUTH REQUIRED MODAL */}
      {authModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "400px",
            textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ backgroundColor: "#f1f5f9", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 8px 0", color: "#0f172a" }}>Sign In Required</h3>
            <p style={{ color: "#64748b", margin: "0 0 24px 0", fontSize: "14px", lineHeight: "1.5" }}>
              Please sign in or create an account to access the ProposalPilot dashboard and analysis tools.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Passes the pending route to the login page so it redirects correctly after login! */}
              <Link href={`/login-test?redirect=${pendingRoute}`} style={{ textDecoration: "none" }}>
                <button className="btn" style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
                  Sign In
                </button>
              </Link>
              <Link href="/test" style={{ textDecoration: "none" }}>
                <button className="btn" style={{ width: "100%", padding: "12px", backgroundColor: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
                  Create Account
                </button>
              </Link>
              <button 
                onClick={() => setAuthModalOpen(false)} 
                style={{ marginTop: "8px", background: "none", border: "none", color: "#64748b", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn"
          style={{
            position: "fixed",
            bottom: "40px",
            right: "24px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
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