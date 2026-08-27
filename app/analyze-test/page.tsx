"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function AnalyzeTest() {
  const router = useRouter();

  const [proposal, setProposal] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // UX States
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyze Proposal");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  
  // Toast & Scroll States
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  const extractPdfText = async (file: File) => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ");
      }
      return text;
    } catch (err) {
      console.error("PDF Extraction Error:", err);
      throw new Error("Failed to extract text from the PDF.");
    }
  };

  const analyze = async () => {
    if (!proposal.trim() && !pdfFile) {
      showToast("Please paste text or upload a PDF.", "error");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");
      setLimitReached(false);
      
      let proposalText = proposal;

      if (pdfFile) {
        setLoadingText("Extracting PDF...");
        proposalText = await extractPdfText(pdfFile);
      }

      setLoadingText("AI is analyzing proposal...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposal: proposalText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setLimitReached(true);
          setError(data.error || "You have reached your free review limit. Please upgrade to Pro.");
        } else {
          setError(data.error || "Failed to analyze the proposal.");
        }
        showToast("Analysis failed.", "error");
        return;
      }

      if (data.review) {
        setResult(data.review);
        showToast("Analysis complete! Review saved.", "success");
      } else {
        setError("Unexpected response from AI.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      showToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
      setLoadingText("Analyze Proposal");
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
      {/* INJECT ANIMATION STYLES */}
      <style>{`
        .btn { transition: all 0.2s ease; }
        .btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .input-area:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
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

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "600", margin: "0 0 8px 0" }}>New Analysis</h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>Paste your text or upload a PDF for AI review.</p>
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
            Go to Dashboard
          </button>
        </div>

        {/* Limit Reached Warning */}
        {limitReached && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "20px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>🔒</span>
            <div>
              <h3 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "16px" }}>Free Limit Reached</h3>
              <p style={{ margin: 0, color: "#b91c1c", fontSize: "14px", lineHeight: "1.5" }}>{error}</p>
              <button 
                className="btn"
                style={{ marginTop: "12px", padding: "8px 16px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}

        {/* Standard Error (Non-Limit) */}
        {error && !limitReached && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "24px", color: "#991b1b", fontSize: "14px", fontWeight: "500" }}>
            {error}
          </div>
        )}

        {/* Input Card */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "32px", marginBottom: "32px" }}>
          
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
            Paste Proposal Text
          </label>
          <textarea
            className="input-area"
            rows={10}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Enter your business proposal, grant application, or pitch details here..."
            disabled={loading || limitReached}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: loading || limitReached ? "#f8fafc" : "#ffffff",
              fontSize: "15px",
              fontFamily: "inherit",
              lineHeight: "1.6",
              resize: "vertical",
              marginBottom: "24px",
              color: "#0f172a"
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
            <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "500" }}>OR UPLOAD</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
          </div>

          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
            Upload PDF Document
          </label>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <input
              type="file"
              accept=".pdf"
              disabled={loading || limitReached}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPdfFile(file);
              }}
              style={{
                padding: "10px",
                border: "1px dashed #cbd5e1",
                borderRadius: "6px",
                width: "100%",
                fontSize: "14px",
                color: "#64748b",
                backgroundColor: loading || limitReached ? "#f8fafc" : "#ffffff"
              }}
            />
            {pdfFile && !loading && !limitReached && (
              <button 
                onClick={() => setPdfFile(null)} 
                style={{ padding: "8px 12px", backgroundColor: "#f1f5f9", border: "none", borderRadius: "6px", color: "#475569", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ marginTop: "32px", textAlign: "right" }}>
            <button
              className="btn"
              onClick={analyze}
              disabled={loading || limitReached || (!proposal.trim() && !pdfFile)}
              style={{
                padding: "12px 24px",
                backgroundColor: loading || limitReached || (!proposal.trim() && !pdfFile) ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: loading || limitReached || (!proposal.trim() && !pdfFile) ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {loading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              )}
              {loadingText}
            </button>
          </div>
        </div>

        {/* Loading Spinner for result area */}
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>

        {/* Results Area */}
        {result && !loading && (
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#166534", margin: 0 }}>
                  AI Analysis Complete
                </h2>
                <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}>
                  Saved to Dashboard
                </span>
              </div>
              <button
                className="btn"
                onClick={() => router.push("/dashboard")}
                style={{ padding: "8px 16px", backgroundColor: "#0f172a", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
              >
                View in Dashboard
              </button>
            </div>
            
            <div style={{ backgroundColor: "#f0fdf4", padding: "24px", borderRadius: "6px", border: "1px solid #bbf7d0", color: "#0f172a", lineHeight: "1.8", fontSize: "15px", whiteSpace: "pre-wrap" }}>
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
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