"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";

interface Review {
  id: string;
  user_id: string;
  project_description: string;
  proposal: string;
  created_at?: string;
}

export default function ReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchReview(params.id as string);
    }
  }, [params]);

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

  // Helper to show temporary toast messages
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  async function fetchReview(id: string) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/reviews/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load review.");
        return;
      }

      setReview(data.review);
    } catch (error) {
      console.error("FETCH REVIEW ERROR:", error);
      setError("Something went wrong while loading the review.");
    } finally {
      setLoading(false);
    }
  }

  // Download PDF
  const downloadPDF = (proposal: string, reviewText: string) => {
    try {
      const pdf = new jsPDF();

      pdf.setFontSize(18);
      pdf.text("ProposalPilot AI Report", 20, 20);

      pdf.setFontSize(12);

      // Original Proposal
      pdf.setFontSize(15);
      pdf.text("Original Proposal", 20, 35);
      pdf.setFontSize(11);

      const proposalLines = pdf.splitTextToSize(proposal, 170);
      let y = 45;

      for (const line of proposalLines) {
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 20, y);
        y += 6;
      }

      // Space before AI Review
      y += 15;
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      // AI Review
      pdf.setFontSize(15);
      pdf.text("AI Review", 20, y);
      y += 10;
      pdf.setFontSize(11);

      const reviewLines = pdf.splitTextToSize(reviewText, 170);

      for (const line of reviewLines) {
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 20, y);
        y += 6;
      }

      pdf.save(`Review-${params.id}.pdf`);
      showToast("PDF downloaded successfully.", "success");
    } catch (err) {
      showToast("Failed to generate PDF.", "error");
    }
  };

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
      {/* INJECT ANIMATION & BUTTON STYLES */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background-color: #e2e8f0;
          border-radius: 4px;
        }
        .btn {
          transition: all 0.2s ease;
        }
        .btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
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
        
        {/* Loading state skeletons */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div className="skeleton" style={{ height: "32px", width: "250px", marginBottom: "8px" }} />
                <div className="skeleton" style={{ height: "16px", width: "150px" }} />
              </div>
              <div className="skeleton" style={{ height: "40px", width: "100px", borderRadius: "6px" }} />
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "30px", backgroundColor: "#ffffff" }}>
              <div className="skeleton" style={{ height: "24px", width: "200px", marginBottom: "20px" }} />
              <div className="skeleton" style={{ height: "16px", width: "100%", marginBottom: "10px" }} />
              <div className="skeleton" style={{ height: "16px", width: "100%", marginBottom: "10px" }} />
              <div className="skeleton" style={{ height: "16px", width: "80%" }} />
            </div>
          </div>
        ) : error || !review ? (
          /* Error / Not Found state */
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: "8px",
              padding: "60px 20px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              marginTop: "40px"
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "500", color: "#dc2626", margin: "0 0 8px 0" }}>
              {error ? "Error Loading Review" : "Review Not Found"}
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px 0" }}>
              {error || "The review you are looking for does not exist or you don't have access to it."}
            </p>
            <button
              className="btn"
              onClick={() => router.back()}
              style={{
                padding: "8px 20px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          /* Main Review Content */
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
                flexWrap: "wrap",
                gap: "16px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "20px",
              }}
            >
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: "600", margin: "0 0 8px 0" }}>
                  Review Details
                </h1>
                {review.created_at && (
                  <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
                    Created on {new Date(review.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn"
                  onClick={() => router.back()}
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
                  ← Back
                </button>
                <button
                  className="btn"
                  onClick={() => downloadPDF(review.project_description, review.proposal)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Original Proposal */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                padding: "32px",
                marginBottom: "24px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: "0 0 20px 0" }}>
                Original Proposal
              </h2>
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "24px",
                  borderRadius: "6px",
                  border: "1px solid #f1f5f9",
                  color: "#334155",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                  fontSize: "15px",
                }}
              >
                {review.project_description}
              </div>
            </div>

            {/* AI Review */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                padding: "32px",
                border: "1px solid #e2e8f0",
                marginBottom: "40px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#166534", margin: 0 }}>
                  AI Analysis & Feedback
                </h2>
                <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}>
                  Groq Powered
                </span>
              </div>
              
              <div
                style={{
                  backgroundColor: "#f0fdf4", // Very light green tint
                  padding: "24px",
                  borderRadius: "6px",
                  border: "1px solid #bbf7d0",
                  color: "#0f172a",
                  lineHeight: "1.8",
                  fontSize: "15px",
                }}
              >
                <ReactMarkdown>{review.proposal}</ReactMarkdown>
              </div>
            </div>
          </>
        )}
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