import React, { useState } from "react";

type Evidence = { type: string; snippet: string };
type Suggestions = {
  prioritized_next_steps: string[];
  quick_edits: string[];
  longer_term?: string[];
};
type AnalysisResponse = {
  overall_score: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  evidence: Evidence[];
  ai_feedback: string;
  suggestions: Suggestions;
  recommended_snippets?: Record<string, string>;
};

export default function ResumeParser() {
  const [resumeContent, setResumeContent] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [endpoint, setEndpoint] = useState("/functions/gemini-resume-analysis"); // adjust if needed
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setAnalysis(null);

    if (!resumeContent.trim() || !targetRole.trim()) {
      setError("Please provide resume content and a target role.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeContent, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || `Server returned ${res.status}`);
      } else {
        setAnalysis(data as AnalysisResponse);
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h3>Resume analyzer</h3>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <label>
          Function endpoint (adjust if deployed elsewhere)
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} style={{ width: "100%" }} />
        </label>

        <label>
          Target role
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} style={{ width: "100%" }} />
        </label>

        <label>
          Paste resume text
          <textarea value={resumeContent} onChange={(e) => setResumeContent(e.target.value)} rows={10} style={{ width: "100%" }} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          <button
            type="button"
            onClick={() => {
              setResumeContent("");
              setTargetRole("");
              setAnalysis(null);
              setError(null);
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div style={{ marginTop: 12, color: "crimson" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {analysis && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <h4 style={{ margin: 0 }}>Score: {analysis.overall_score}/100</h4>
            <small>Confidence: {analysis.confidence}%</small>
          </div>

          <section style={{ marginTop: 8 }}>
            <strong>AI feedback</strong>
            <p style={{ whiteSpace: "pre-wrap" }}>{analysis.ai_feedback}</p>
          </section>

          <section>
            <strong>Strengths</strong>
            <ul>
              {analysis.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>

          <section>
            <strong>Weaknesses</strong>
            <ul>
              {analysis.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>

          <section>
            <strong>Suggestions (prioritized)</strong>
            <ol>
              {analysis.suggestions.prioritized_next_steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>

            <details style={{ marginTop: 6 }}>
              <summary>Quick edits</summary>
              <ul>
                {analysis.suggestions.quick_edits.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </details>
          </section>

          <section>
            <strong>Evidence</strong>
            <ul>
              {analysis.evidence.map((evi, i) => (
                <li key={i}>
                  <em>{evi.type}:</em> {evi.snippet}
                </li>
              ))}
            </ul>
          </section>

          {analysis.recommended_snippets && (
            <section>
              <strong>Snippet templates</strong>
              <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 8 }}>
                {Object.entries(analysis.recommended_snippets).map(([k, v]) => `${k}:\n${v}\n\n`).join("")}
              </pre>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
