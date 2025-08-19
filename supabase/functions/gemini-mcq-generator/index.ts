// index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = "AIzaSyDYo0GtxH-0eQjRsevfuvMWaGRi4Dce880"; // TODO: move to env var
const GEMINI_MODEL = "gemini-2.5-flash";

type McqItem = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
};

// --- Sanitizers & filters ----------------------------------------------------

const TECH_TOKENS = [
  // Languages
  "python","java","javascript","typescript","c#","c++","go","golang","rust","kotlin","swift","php",
  // Web/Frameworks
  "react","angular","vue","svelte","next.js","nuxt","remix","vite","express","nestjs","spring","spring boot","django","flask","fastapi",".net",".net core","asp.net","laravel","rails",
  // Data/Queues/Search
  "postgres","mysql","mariadb","mongodb","dynamodb","redis","elasticsearch","kafka","rabbitmq","sqs","sns","kinesis","neo4j","clickhouse",
  // Cloud/Infra
  "aws","azure","gcp","docker","kubernetes","helm","terraform","cloudformation","nginx","istio","linkerd",
  // APIs/Proto
  "rest","graphql","grpc","websocket","socket.io","openapi","swagger",
  // CI/CD & Testing
  "jenkins","github actions","gitlab ci","circleci","pytest","unittest","jest","mocha","chai","cypress","playwright","selenium","junit",
  // Tools/Build
  "webpack","babel","esbuild","ts-node","pnpm","yarn","npm","maven","gradle","poetry","pipenv",
  // Observability
  "prometheus","grafana","elk","opentelemetry","sentry","datadog","new relic",
];

const NAME_PATTERNS = [/abhiram/i, /bharadwaj/i, /\bG\s*S\b/i];

const COMPANY_SUFFIX = /\b(inc|llc|ltd|pvt|pvt\.?\s*ltd|llp|technologies|solutions|systems|labs)\b/i;
const MONTH_WORD = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
const YEAR_WORD = /\b(19|20)\d{2}\b/;
const DURATION_WORD = /\b\d+\s*(years?|yrs?|months?|mos?)\b/i;

const HR_PHRASES = [
  /how\s+long/i,
  /worked\s+as/i,
  /work(?:ed)?\s+at/i,
  /tenure/i,
  /duration/i,
  /\bexperience\b/i,
  /\brole\b/i,
  /\bposition\b/i,
  /\bdesignation\b/i,
  /\bsoftware\s+engineer\b/i,
  /\bsenior\b/i,
  /\bintern(ship)?\b/i,
  /\beducation|graduation|college|university|cgpa|gpa\b/i,
  /\bemail|phone|mobile|address|linkedin|github\b/i,
];

function sanitizeResume(raw: string): string {
  // Drop lines that are likely personal / HR headings
  const lines = raw.split(/\r?\n/);
  const kept = lines.filter((ln) => {
    const l = ln.trim();
    if (!l) return false;
    if (NAME_PATTERNS.some((re) => re.test(l))) return false;
    if (COMPANY_SUFFIX.test(l)) return true; // keep if it's inside a tech bullet; otherwise check below
    if (HR_PHRASES.some((re) => re.test(l))) return false;
    if (MONTH_WORD.test(l) || YEAR_WORD.test(l) || DURATION_WORD.test(l)) return false;
    // Remove obvious contact lines
    if (/\b(@|\.com|mailto:|https?:\/\/)/i.test(l) && /linkedin|github|email|phone|mobile|portfolio/i.test(l)) return false;
    return true;
  });

  // Keep only lines that look technical or project-related
  const techy = kept.filter((l) => {
    const ll = l.toLowerCase();
    return (
      /project|module|service|microservice|feature|stack|tech|technology|framework|library|database|api|architecture|design|pattern|kpi|latency|throughput|scal(e|ing)|deploy|pipeline/i.test(
        ll,
      ) ||
      TECH_TOKENS.some((t) => ll.includes(t))
    );
  });

  // Fallback: if we filtered too much, return original
  return techy.length >= 5 ? techy.join("\n") : raw;
}

function containsTechToken(text: string): boolean {
  const t = text.toLowerCase();
  return TECH_TOKENS.some((k) => t.includes(k));
}

function looksPersonalOrHR(text: string): boolean {
  if (!text) return true;
  if (NAME_PATTERNS.some((re) => re.test(text))) return true;
  if (COMPANY_SUFFIX.test(text)) return true;
  if (MONTH_WORD.test(text) || YEAR_WORD.test(text) || DURATION_WORD.test(text)) return true;
  if (HR_PHRASES.some((re) => re.test(text))) return true;
  return false;
}

function filterQuestions(items: McqItem[]): McqItem[] {
  return items.filter((q) => {
    const qt = q?.question ?? "";
    if (looksPersonalOrHR(qt)) return false;
    if (!containsTechToken(qt)) return false; // must mention at least one tech/stack token
    return true;
  });
}

// --- Prompting & LLM call ----------------------------------------------------

function buildPrompt(resumeContent: string, questionCount: number, ultraStrict = false) {
  const extra = ultraStrict
    ? "Return ONLY raw JSON (no prose, no code fences). Do not mention names, job titles, company names, dates, or durations."
    : "Return ONLY raw JSON (no prose, no code fences).";

  return `
Create ${questionCount} **technical, project-specific** multiple-choice questions from the resume.

Rules:
- Every question MUST be about the tech stack, frameworks, libraries, databases, APIs, cloud, patterns, tooling, or architecture used **in a specific project described in the resume**.
- Include the **project's exact name** in the question text (e.g., "In the <Project Name> project, ...").
- DO NOT ask about personal details (name, email, phone, location), employment dates, durations/tenure, job titles, total years of experience, education, or company names.
- If an item would be personal/HR-style, SKIP it (do not invent facts).

Output format (JSON array only):
[
  {
    "question": "In the <Project Name> project, which database was used for <X>?",
    "option_a": "string",
    "option_b": "string",
    "option_c": "string",
    "option_d": "string",
    "correct_answer": "A"
  }
  // ... ${questionCount} items
]

${extra}

Resume (tech-only view may be sanitized):
${resumeContent}
`.trim();
}

// Extract JSON array from model output
function extractJsonArray(text: string): McqItem[] {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let candidate = (fence ? fence[1] : text).trim();

  const i = candidate.indexOf("[");
  const j = candidate.lastIndexOf("]");
  if (i !== -1 && j !== -1 && j > i) candidate = candidate.slice(i, j + 1);

  const arr = JSON.parse(candidate);
  if (!Array.isArray(arr)) throw new Error("Model did not return a JSON array.");
  return arr as McqItem[];
}

async function callGemini(prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );

  const raw = await res.text();
  console.log("Gemini status:", res.status);
  console.log("Gemini raw:", raw);

  if (!res.ok) throw new Error(`Gemini API error (${res.status}): ${raw}`);

  const result = JSON.parse(raw);
  const text: string = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Empty response text.");
  return text;
}

async function generateMCQsWithGemini(resumeContent: string, questionCount: number) {
  // 1) Sanitize resume to remove personal lines but keep tech/project content
  const sanitized = sanitizeResume(resumeContent);

  // 2) Over-ask so we can filter aggressively
  const target = Math.max(questionCount * 2, questionCount + 6);

  // First attempt
  let text = await callGemini(buildPrompt(sanitized, target, false));
  let items = filterQuestions(extractJsonArray(text));

  // Retry once if not enough
  if (items.length < questionCount) {
    text = await callGemini(buildPrompt(sanitized, target, true));
    items = filterQuestions(extractJsonArray(text));
  }

  if (!items.length) {
    throw new Error("No technical questions generated after filtering. Check resume content for clear project/stack details.");
  }

  // Return exactly N
  return items.slice(0, questionCount);
}

// --- HTTP server & CORS ------------------------------------------------------

function corsHeaders(extra: Record<string, string> = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-client-info, x-request-id, x-application-id",
    ...extra,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: corsHeaders({ "Content-Type": "application/json" }) },
    );
  }

  const { resumeContent, questionCount } = payload || {};
  if (!resumeContent || typeof resumeContent !== "string" || !Number.isFinite(questionCount)) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: resumeContent (string), questionCount (number)" }),
      { status: 400, headers: corsHeaders({ "Content-Type": "application/json" }) },
    );
  }

  try {
    const questions = await generateMCQsWithGemini(resumeContent, questionCount);
    return new Response(
      JSON.stringify({ questions }),
      { headers: corsHeaders({ "Content-Type": "application/json" }) },
    );
  } catch (err) {
    console.error("Gemini MCQ Generator Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: corsHeaders({ "Content-Type": "application/json" }) },
    );
  }
});
