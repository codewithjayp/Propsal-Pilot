"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  user_id?: string;
  project_description: string;
  proposal: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchReviews();
  }, []);

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

  // ==============================
  // FETCH REVIEWS
  // ==============================
  async function fetchReviews() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/reviews", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load reviews.");
        setReviews([]);
        return;
      }

      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      setError("Something went wrong while loading reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // VIEW REVIEW
  // ==============================
  function viewReview(id: string) {
    router.push(`/dashboard/reviews/${id}`);
  }

  // ==============================
  // DELETE REVIEW
  // ==============================
  async function deleteReview(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this review? This action cannot be undone.");

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to delete review.", "error");
        return;
      }

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== id)
      );

      showToast("Review deleted successfully.", "success");
    } catch (error) {
      showToast("Something went wrong while deleting.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  // ==============================
  // DOWNLOAD PDF
  // ==============================
  function downloadPDF(proposal: string, review: string) {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("ProposalPilot AI Report", 20, 20);

    pdf.setFontSize(15);
    pdf.text("Original Proposal", 20, 35);
    pdf.setFontSize(11);

    const proposalLines = pdf.splitTextToSize(proposal || "", 170);
    let y = 45;

    for (const line of proposalLines) {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += 6;
    }

    y += 15;
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(15);
    pdf.text("AI Review", 20, y);
    y += 10;
    pdf.setFontSize(11);

    const reviewLines = pdf.splitTextToSize(review || "", 170);

    for (const line of reviewLines) {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += 6;
    }

    pdf.save("proposal-review.pdf");
    showToast("PDF downloaded successfully.", "success");
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
      }}
    >
      {/* INJECT ANIMATION STYLES */}
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
            right: "24px",
            backgroundColor: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: toast.type === "success" ? "#166534" : "#991b1b",
            padding: "12px 20px",
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

      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "16px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "600", margin: 0 }}>
          Reviews
        </h1>
        <button
          className="btn"
          onClick={() => router.push("/analyze-test")}
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
          + New Analysis
        </button>
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "16px",
            borderRadius: "8px",
            color: "#991b1b",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500 }}>{error}</span>
          <button
            onClick={fetchReviews}
            style={{
              background: "transparent",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              padding: "4px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* LOADING SKELETONS */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "24px",
                backgroundColor: "#ffffff",
              }}
            >
              <div className="skeleton" style={{ height: "24px", width: "200px", marginBottom: "16px" }} />
              <div className="skeleton" style={{ height: "16px", width: "100%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "16px", width: "100%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "16px", width: "80%" }} />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !error ? (
        /* EMPTY STATE */
        <div
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: "8px",
            padding: "60px 20px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 auto 16px auto", display: "block" }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h2 style={{ fontSize: "18px", fontWeight: "500", color: "#334155", margin: "0 0 8px 0" }}>
            No reviews yet
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px 0" }}>
            Submit your first proposal or pitch to get detailed AI feedback.
          </p>
          <button
            className="btn"
            onClick={() => router.push("/analyze-test")}
            style={{
              padding: "8px 20px",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Analyze a Proposal
          </button>
        </div>
      ) : (
        /* REVIEWS LIST */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                overflow: "hidden", // Keeps the footer contained
              }}
            >
              {/* CARD BODY */}
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600" }}>
                    Proposal Analysis
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently added"}
                    {" • ID: " + review.id.split("-")[0]}
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid #f1f5f9",
                    fontSize: "14px",
                    color: "#334155",
                    lineHeight: "1.6",
                    maxHeight: "150px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <ReactMarkdown>{review.proposal || ""}</ReactMarkdown>
                  {/* Fading bottom edge to indicate more content */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60px",
                      background: "linear-gradient(transparent, #f8fafc)",
                    }}
                  />
                </div>
              </div>

              {/* CARD FOOTER (ACTIONS) */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                  padding: "12px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn"
                    onClick={() => viewReview(review.id)}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    Read Full Review
                  </button>
                  <button
                    className="btn"
                    onClick={() => downloadPDF(review.project_description, review.proposal)}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#ffffff",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    Export PDF
                  </button>
                </div>

                <button
                  className="btn"
                  onClick={() => deleteReview(review.id)}
                  disabled={deletingId === review.id}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "transparent",
                    color: deletingId === review.id ? "#94a3b8" : "#ef4444",
                    border: "none",
                    cursor: deletingId === review.id ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {deletingId === review.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn"
          style={{
            position: "fixed",
            bottom: "80px", // Positioned slightly above the toast notification
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