import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Improved extraction: capture multiple project mentions and nearby context
function extractProjects(resume: string) {
  const projects: string[] = [];
  const regex = /(?:project[s]?\s*[:\-]?\s*)([^\n\.\;]+)/ig;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(resume)) !== null) {
    const p = m[1].trim();
    if (p) projects.push(p.replace(/\s{2,}/g, ' '));
  }
  // fallback: try to capture lines with "led" or "built" that indicate projects
  const altRegex = /(led|built|developed|implemented)\s([^\.\n]+)/ig;
  let m2: RegExpExecArray | null;
  while ((m2 = altRegex.exec(resume)) !== null) {
    const p = m2[2].trim();
    if (p && projects.indexOf(p) === -1) projects.push(p.replace(/\s{2,}/g, ' '));
  }
  return projects;
}

// Improved extraction for company names with some context
function extractCompanies(resume: string) {
  const companies: string[] = [];
  const regex = /\b(?:at|@|company[:\-])\s*([A-Z][A-Za-z0-9&\.\- ]{2,50})/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(resume)) !== null) {
    const c = m[1].trim();
    if (c) companies.push(c.replace(/\s{2,}/g, ' '));
  }
  // also try "Company Name - Role" patterns
  const alt = /([A-Z][A-Za-z0-9&\.\- ]{2,50})\s*[-|—]\s*(?:Software|Engineer|Manager|Lead|Developer)/g;
  let m2: RegExpExecArray | null;
  while ((m2 = alt.exec(resume)) !== null) {
    const c = m2[1].trim();
    if (c && companies.indexOf(c) === -1) companies.push(c);
  }
  return companies;
}

// simple skill extraction and scoring
function extractSkills(resume: string) {
  const SKILLS = ["python","javascript","typescript","sql","aws","azure","docker","kubernetes","ci/cd","git","tensorflow","pytorch","react","node","react native","flutter","ml","data analysis","kafka"];
  const lower = resume.toLowerCase();
  const found: string[] = [];
  for (const s of SKILLS) {
    if (lower.includes(s)) found.push(s);
  }
  return found;
}

// produce an honest, evidence-backed analysis
function analyzeResume(resume: string, targetRole: string) {
  const trimmed = resume.trim();
  const shortResume = trimmed.length < 120;
  const projects = extractProjects(resume);
  const companies = extractCompanies(resume);
  const skills = extractSkills(resume);

  // base scoring with simple rules (transparent and honest)
  let score = 50;
  // reward skills found
  score += Math.min(skills.length * 6, 30); // up to +30
  // reward project experience
  score += Math.min(projects.length * 4, 12);
  // small bonus for company mentions
  if (companies.length) score += 4;

  // penalty for overly short resume or missing summary
  if (shortResume) score -= 20;
  if (!/summary|profile|objective/i.test(resume)) score -= 6;

  // clamp
  score = Math.max(0, Math.min(100, Math.round(score)));

  // confidence: lower if resume short or few explicit skills
  let confidence = 60 + (skills.length * 6) + (projects.length * 4);
  if (shortResume) confidence -= 30;
  confidence = Math.max(20, Math.min(95, Math.round(confidence)));

  // Build honest feedback text with caveats
  const honest_feedback: string[] = [];
  if (shortResume) honest_feedback.push("Resume appears very short — analysis is limited by available content.");
  if (skills.length === 0) honest_feedback.push("No clear technical skills detected; this reduces confidence.");
  if (projects.length === 0) honest_feedback.push("No explicit projects found; adding project descriptions with outcomes will help.");
  if (!/certificat|certified|course|degree/i.test(resume)) honest_feedback.push("No certifications or formal training detected; adding relevant certs can improve fit.");

  // Evidence examples (short snippets)
  const evidence: { type: string; snippet: string }[] = [];
  for (const p of projects.slice(0,3)) evidence.push({ type: "project", snippet: p });
  for (const c of companies.slice(0,3)) evidence.push({ type: "company", snippet: c });
  for (const s of skills.slice(0,8)) evidence.push({ type: "skill", snippet: s });

  // Concrete, prioritized suggestions
  const suggestions = {
    prioritized_next_steps: [
      "Add a 2-3 sentence professional summary focused on the target role with quantifiable outcomes.",
      "For each project, add 1-2 bullet points with achievements and metrics (e.g., % improvement, scale, impact).",
      "List key technical skills at the top and include versions/tools (e.g., Docker, Kubernetes, AWS EC2)."
    ],
    quick_edits: [
      "Add metrics to one recent project: 'Reduced latency by 30% by refactoring X pipeline.'",
      "Include a Certifications section if you have relevant certificates (AWS, TensorFlow, etc.).",
      "Format experience bullets to start with strong action verbs and end with measurable results."
    ],
    longer_term: [
      "If targeting ML roles, add 1-2 small reproducible projects with data and evaluation metrics.",
      "If targeting DevOps/Platform roles, add CI/CD and containerization examples and the deployment scale.",
    ]
  };

  // Recommended resume snippet examples (concise templates)
  const recommended_snippets = {
    professional_summary: `Experienced ${targetRole} with X+ years delivering measurable results (e.g., reduced costs by 20%, improved throughput by 30%). Focus: [primary technologies].`,
    project_bullet: `Developed [feature] using [tech] which resulted in [quantified outcome, metric]. Example: Reduced processing time by 40% through optimized data pipeline using Python and AWS Lambda.`
  };

  // Honest analysis text
  const ai_feedback = `
Overall, the resume scores ${score}/100 with confidence ${confidence}%. 
${honest_feedback.length ? "Notes: " + honest_feedback.join(" ") : "No major caveats detected."}
This assessment focuses on explicit mentions of projects, companies, and technical skills. If key experience is omitted (e.g., private projects, NDA work), add concise descriptions to improve accuracy.
  `.trim();

  return {
    overall_score: score,
    confidence,
    strengths: [
      ...(skills.length ? [`Detected skills: ${skills.join(", ")}`] : []),
      ...(projects.length ? [`Project mentions detected (${projects.length})`] : []),
      ...(companies.length ? [`Company mentions detected (${companies.length})`] : [])
    ],
    weaknesses: [
      ...(shortResume ? ["Resume too brief for a full assessment"] : []),
      ...(!skills.length ? ["No technical skills explicitly listed"] : []),
      ...(!projects.length ? ["Lack of explicit project result statements"] : [])
    ],
    evidence,
    ai_feedback,
    suggestions,
    recommended_snippets
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, x-request-id, x-application-id",
      },
    });
  }

  // Validate input quickly and return honest error if missing
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }

  const { resumeContent, targetRole } = payload || {};
  if (!resumeContent || typeof resumeContent !== "string" || !targetRole || typeof targetRole !== "string") {
    return new Response(JSON.stringify({ error: "Missing required fields: resumeContent (string), targetRole (string)" }), { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }

  // Produce the detailed honest analysis promptly
  const analysis = analyzeResume(resumeContent, targetRole);

  return new Response(JSON.stringify(analysis, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }
  });
});