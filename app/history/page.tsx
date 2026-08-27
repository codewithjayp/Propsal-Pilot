"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  project_description: string;
  proposal: string;
  created_at?: string;
}

export default function HistoryPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle scroll position
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
        setError(data.error || "Failed to load history.");
        setReviews([]);
        return;
      }

      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      setError("Something went wrong while loading history.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  // Filter reviews based on search query
  const filteredReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return (
      review.project_description?.toLowerCase().includes(query) ||
      review.proposal?.toLowerCase().includes(query) ||
      review.id.toLowerCase().includes(query)
    );
  });

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
      <style>{`
        .btn { transition: all 0.2s ease; }
        .btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .input-area:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background-color: #e2e8f0;
          border-radius: 4px;
        }
        .table-row:hover { background-color: #f1f5f9; }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "600", margin: "0 0 8px 0" }}>Analysis History</h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>Search and manage all your past proposal reviews.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn"
              onClick={() => router.push("/analyze-test")}
              style={{
                padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500",
              }}
            >
              + New Analysis
            </button>
            <button
              className="btn"
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "8px 16px", backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500",
              }}
            >
              Card View
            </button>
          </div>
        </div>

        {/* Search & Controls */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by keyword, ID, or proposal text..."
              className="input-area"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap" }}>
            {filteredReviews.length} Records
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "16px", borderRadius: "8px", color: "#991b1b", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {/* Data Table */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Review ID</th>
                  <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Proposal Preview</th>
                  <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Loading Skeleton Rows
                  [1, 2, 3].map((n) => (
                    <tr key={n} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "16px 20px" }}><div className="skeleton" style={{ height: "16px", width: "100px" }} /></td>
                      <td style={{ padding: "16px 20px" }}><div className="skeleton" style={{ height: "16px", width: "80px" }} /></td>
                      <td style={{ padding: "16px 20px" }}><div className="skeleton" style={{ height: "16px", width: "100%" }} /></td>
                      <td style={{ padding: "16px 20px" }}><div className="skeleton" style={{ height: "30px", width: "80px", marginLeft: "auto" }} /></td>
                    </tr>
                  ))
                ) : filteredReviews.length === 0 ? (
                  // Empty State
                  <tr>
                    <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                      {searchQuery ? "No reviews match your search." : "No history found. Start by analyzing a proposal."}
                    </td>
                  </tr>
                ) : (
                  // Actual Data
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="table-row" style={{ borderBottom: "1px solid #e2e8f0", transition: "background-color 0.2s" }}>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#334155", whiteSpace: "nowrap" }}>
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#64748b", fontFamily: "monospace" }}>
                        {review.id.split("-")[0]}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#0f172a" }}>
                        <div style={{ maxWidth: "400px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {review.project_description || "No proposal text"}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <button
                          className="btn"
                          onClick={() => router.push(`/dashboard/reviews/${review.id}`)}
                          style={{
                            padding: "6px 12px", backgroundColor: "#0f172a", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500",
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn"
          style={{
            position: "fixed", bottom: "40px", right: "24px", backgroundColor: "#0f172a", color: "#ffffff", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)", zIndex: 999,
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