const allowedLinks = {
  docs: "#docs",
  learningPath: "learn.html",
  pythonGuide: "python.html",
  github: "https://github.com/hepter-studios/mompy",
  issues: "https://github.com/hepter-studios/mompy/issues",
  newIssue: "https://github.com/hepter-studios/mompy/issues/new",
  discussions: "https://github.com/hepter-studios/mompy/discussions",
  discord: "https://discord.gg/fqxvyGFyfa",
  releases: "https://github.com/hepter-studios/mompy/releases",
};

const normalizeText = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const buildIssueDraft = (message, category) =>
  [
    `Mompy ${category === "feature request" ? "feature request" : "issue report"}`,
    "",
    "Category:",
    category,
    "",
    "What happened:",
    message,
    "",
    "Expected behavior:",
    "- ",
    "",
    "What I tried:",
    "- ",
    "",
    "Environment:",
    "- OS:",
    "- Mompy version:",
  ].join("\n");

const routes = [
  {
    category: "installation",
    confidence: 0.82,
    keywords: ["install", "installation", "setup", "download", "installation error", "setup error", "baixar", "instalar", "instalacao", "erro na instalacao"],
    reply: "This sounds like installation trouble. Start with docs, then confirm you are using the latest release.",
    actions: [
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Download Latest Version", type: "external", target: allowedLinks.releases },
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
    ],
  },
  {
    category: "startup",
    confidence: 0.82,
    keywords: ["open", "start", "run", "launch", "startup", "abrir", "abre", "nao abre", "mompy nao abre", "iniciar", "rodar", "executar"],
    reply: "This looks like a startup issue. Check docs and the latest release first; if it still fails, open a report.",
    report: true,
    actions: [
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Download Latest Version", type: "external", target: allowedLinks.releases },
      { label: "Copy Report", type: "copy" },
      { label: "Open GitHub Issue", type: "external", target: allowedLinks.newIssue },
    ],
  },
  {
    category: "bug",
    confidence: 0.88,
    keywords: ["bug", "error", "crash", "broken", "fail", "not working", "erro", "travou", "quebrado", "falha", "bugou", "nao funciona"],
    reply: "This looks like a bug or crash. I prepared a clean report draft for GitHub Issues.",
    report: true,
    actions: [
      { label: "Generate Report", type: "issue_draft" },
      { label: "Copy Report", type: "copy" },
      { label: "Open GitHub Issue", type: "external", target: allowedLinks.newIssue },
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
    ],
  },
  {
    category: "mission",
    confidence: 0.78,
    keywords: ["mission", "challenge", "missao", "desafio", "listas", "list", "loop", "function", "funcao"],
    reply: "This looks like a mission question. Open the learning path and mention the mission number if you ask the community.",
    actions: [
      { label: "Open Learning Path", type: "external", target: allowedLinks.learningPath },
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Ask Community", type: "external", target: allowedLinks.discord },
    ],
  },
  {
    category: "lesson",
    confidence: 0.76,
    keywords: ["lesson", "exercise", "aula", "licao", "exercicio", "nao entendi"],
    reply: "This sounds like a lesson question. Open the learning path first, then use docs or community help.",
    actions: [
      { label: "Open Learning Path", type: "external", target: allowedLinks.learningPath },
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Ask Community", type: "external", target: allowedLinks.discord },
    ],
  },
  {
    category: "feature request",
    confidence: 0.82,
    keywords: ["idea", "suggestion", "feature", "ideia", "sugestao", "recurso", "melhoria"],
    reply: "Good feature-request territory. Shape the idea in Discussions before it becomes an issue.",
    report: true,
    actions: [
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
      { label: "Create Feature Request Draft", type: "issue_draft" },
      { label: "Copy Report", type: "copy" },
    ],
  },
  {
    category: "documentation",
    confidence: 0.76,
    keywords: ["docs", "documentation", "guide", "python", "documentacao", "guia"],
    reply: "This sounds documentation-related. Start with the docs section or the Python guide.",
    actions: [
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Python Guide", type: "external", target: allowedLinks.pythonGuide },
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
    ],
  },
  {
    category: "account/community",
    confidence: 0.72,
    keywords: ["discord", "community", "chat", "comunidade", "conversar", "alguem", "ajuda ao vivo"],
    reply: "For quick conversation, use Discord. For searchable questions, use GitHub Discussions.",
    actions: [
      { label: "Join Discord", type: "external", target: allowedLinks.discord },
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
    ],
  },
];

const classifyLocally = (message) => {
  const normalized = normalizeText(message);
  const route = routes
    .map((item) => ({
      ...item,
      score: item.keywords.filter((keyword) => normalized.includes(normalizeText(keyword))).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (!route) return null;

  const reportDraft = route.report ? buildIssueDraft(message, route.category) : "";
  return {
    reply: route.reply,
    category: route.category,
    confidence: route.confidence,
    actions: route.actions.map((action) => ({
      ...action,
      payload: action.type === "issue_draft" ? reportDraft : action.payload,
    })),
    reportDraft,
  };
};

const callGemini = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are Mompy's support assistant. Mompy is a retro Python learning console app for Windows.
Your job is to help users with installation issues, bugs, lessons, missions, and feature requests.
Always be concise, friendly, and direct. Reply in the same language the user writes in.
Only suggest these actions when relevant: read docs, download latest version, open GitHub issue, join Discord, open discussions.
Never make up information. If unsure, direct to Discord or GitHub Discussions.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
      }),
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? text.trim() : null;
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const message = String(body.message || "").trim().slice(0, 2000);
  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  // Try local classification first for high-confidence matches
  const local = classifyLocally(message);
  if (local && local.confidence >= 0.82) {
    return res.status(200).json(local);
  }

  // Fall back to Gemini for low-confidence or unrecognized messages
  const aiReply = await callGemini(message);
  if (aiReply) {
    return res.status(200).json({
      reply: aiReply,
      category: local?.category || "general",
      confidence: 0.9,
      actions: local?.actions || [
        { label: "Join Discord", type: "external", target: allowedLinks.discord },
        { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
      ],
    });
  }

  // Final fallback to local if Gemini fails
  if (local) return res.status(200).json(local);

  return res.status(200).json({
    reply: "What is blocking you: installation, an error, a lesson, a mission, or an idea?",
    category: "unclear",
    confidence: 0.35,
    actions: [
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Ask Community", type: "external", target: allowedLinks.discord },
    ],
  });
};
