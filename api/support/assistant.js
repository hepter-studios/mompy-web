const MOMPY_APP_REPO = "hepter-studios/mompy";
const MOMPY_WEB_REPO = "hepter-studios/mompy-web";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

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

const truncate = (text, max = 12000) => {
  const value = String(text || "");
  return value.length > max ? `${value.slice(0, max)}\n...[truncated]` : value;
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || "").match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

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
    "- Browser/site page:",
    "- Mompy version:",
  ].join("\n");

const routes = [
  {
    category: "installation",
    confidence: 0.82,
    keywords: ["install", "installation", "setup", "download", "installation error", "setup error", "baixar", "instalar", "instalacao", "erro na instalacao"],
    reply: "This sounds like installation trouble. Start with docs, confirm you are using the latest release, then open Discussions if the installer still fails.",
    actions: [
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Download Latest Version", type: "external", target: allowedLinks.releases },
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
    ],
  },
  {
    category: "startup",
    confidence: 0.84,
    keywords: ["open", "start", "run", "launch", "startup", "abrir", "abre", "nao abre", "mompy nao abre", "iniciar", "rodar", "executar"],
    reply: "This looks like a startup issue. I prepared a report and sent it to the project triage path.",
    report: true,
    createIssue: true,
    actions: [
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Download Latest Version", type: "external", target: allowedLinks.releases },
      { label: "Copy Report", type: "copy" },
      { label: "Open GitHub Issue", type: "external", target: allowedLinks.newIssue },
    ],
  },
  {
    category: "bug",
    confidence: 0.9,
    keywords: ["bug", "error", "crash", "broken", "fail", "not working", "erro", "travou", "quebrado", "falha", "bugou", "nao funciona", "não funciona"],
    reply: "This looks like a bug or crash. I prepared a clean report and sent it to the project triage path.",
    report: true,
    createIssue: true,
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
    keywords: ["lesson", "exercise", "aula", "licao", "exercicio", "nao entendi", "não entendi"],
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
    keywords: ["idea", "suggestion", "feature", "ideia", "sugestao", "sugestão", "recurso", "melhoria"],
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
    keywords: ["docs", "documentation", "guide", "python", "documentacao", "documentação", "guia"],
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
    keywords: ["discord", "community", "chat", "comunidade", "conversar", "alguem", "alguém", "ajuda ao vivo"],
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
    .sort((a, b) => b.score - a.score || b.confidence - a.confidence)[0];

  if (!route) {
    return {
      reply: "What is blocking you: installation, an error, a lesson, a mission, or an idea?",
      category: "unclear",
      confidence: 0.35,
      createIssue: false,
      actions: [
        { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
        { label: "Ask Community", type: "external", target: allowedLinks.discord },
      ],
      reportDraft: "",
    };
  }

  const reportDraft = route.report ? buildIssueDraft(message, route.category) : "";
  return {
    reply: route.reply,
    category: route.category,
    confidence: route.confidence,
    createIssue: Boolean(route.createIssue),
    actions: route.actions.map((action) => ({
      ...action,
      payload: action.type === "issue_draft" ? reportDraft : action.payload,
    })),
    reportDraft,
  };
};

let repositoryContextCache;
let repositoryContextTime = 0;

const githubHeaders = () => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "mompy-support-assistant",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

const fetchWithTimeout = async (url, options = {}, timeoutMs = 6500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const fetchRepoReadme = async (repo) => {
  const response = await fetchWithTimeout(`https://api.github.com/repos/${repo}/readme`, {
    headers: githubHeaders(),
  });
  if (!response.ok) return "";
  const data = await response.json();
  return Buffer.from(data.content || "", data.encoding === "base64" ? "base64" : "utf8").toString("utf8");
};

const fetchRepoTreeSummary = async (repo) => {
  const response = await fetchWithTimeout(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`, {
    headers: githubHeaders(),
  });
  if (!response.ok) return "";
  const data = await response.json();
  const paths = (data.tree || [])
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter((filePath) =>
      /^(README|docs\/|src\/|app\/|api\/|assets\/|public\/|index\.html|learn\.html|docs\.html|python\.html|package\.json|pyproject\.toml|requirements\.txt|main\.py|mompy)/i.test(filePath)
    )
    .slice(0, 160);
  return paths.join("\n");
};

const getRepositoryContext = async () => {
  const now = Date.now();
  if (repositoryContextCache && now - repositoryContextTime < 10 * 60 * 1000) {
    return repositoryContextCache;
  }

  try {
    const [appReadme, appTree, webReadme, webTree] = await Promise.all([
      fetchRepoReadme(MOMPY_APP_REPO),
      fetchRepoTreeSummary(MOMPY_APP_REPO),
      fetchRepoReadme(MOMPY_WEB_REPO),
      fetchRepoTreeSummary(MOMPY_WEB_REPO),
    ]);

    repositoryContextCache = truncate(
      [
        "Mompy app repository context:",
        truncate(appReadme, 5000),
        "",
        "Mompy app relevant file map:",
        truncate(appTree, 2500),
        "",
        "Mompy website repository context:",
        truncate(webReadme, 3500),
        "",
        "Mompy website relevant file map:",
        truncate(webTree, 2200),
      ].join("\n"),
      12000
    );
    repositoryContextTime = now;
    return repositoryContextCache;
  } catch {
    return "Repository context unavailable. Mompy is a retro Python learning console with lessons, missions, local progress, validation feedback, docs, support, community, and a Vercel-hosted website.";
  }
};

const buildGeminiPrompt = ({ message, localResponse, page, context, repositoryContext }) => `
You are Mompy Support, a concise and practical support assistant for Mompy.

Mompy is a retro Python learning console for beginners. It teaches Python through lessons, missions, a code editor, validation feedback, local progress, docs, and community support.

Answer in the same language as the user when possible. Be helpful, direct, and specific. Do not claim to have performed actions unless the backend metadata says an action happened. Do not expose secrets, tokens, webhook URLs, private config, or internal implementation details.

Known routing:
- Docs: ${allowedLinks.docs}
- Learning path: ${allowedLinks.learningPath}
- Python guide: ${allowedLinks.pythonGuide}
- GitHub issues: ${allowedLinks.issues}
- GitHub discussions: ${allowedLinks.discussions}
- Discord: ${allowedLinks.discord}
- Releases: ${allowedLinks.releases}

Repository context:
${repositoryContext}

Local classification:
category=${localResponse.category}
confidence=${localResponse.confidence}
should_create_issue=${localResponse.createIssue}

Page context:
page=${page || "unknown"}
active_section=${context || "unknown"}

User message:
${message}

Return strict JSON only:
{
  "reply": "short support response",
  "category": "bug|startup|installation|lesson|mission|feature request|documentation|account/community|unclear",
  "confidence": 0.0,
  "shouldCreateIssue": false,
  "issueTitle": "short GitHub issue title if needed",
  "issueBody": "clean issue body if needed",
  "actions": [
    {"label":"Read Docs","type":"scroll","target":"#docs"}
  ]
}
`;

const allowedActionTargets = new Set(Object.values(allowedLinks));

const sanitizeActions = (actions, fallbackActions) => {
  if (!Array.isArray(actions)) return fallbackActions;
  const clean = actions
    .filter((action) => action && typeof action.label === "string" && typeof action.type === "string")
    .map((action) => ({
      label: action.label.slice(0, 36),
      type: action.type,
      target: action.target,
      payload: action.payload,
    }))
    .filter((action) => {
      if (["copy", "issue_draft"].includes(action.type)) return true;
      if (action.type === "scroll") return action.target === allowedLinks.docs;
      if (action.type === "external") return allowedActionTargets.has(action.target);
      return false;
    })
    .slice(0, 4);
  return clean.length ? clean : fallbackActions;
};

const callGemini = async ({ message, localResponse, page, context }) => {
  if (!process.env.GEMINI_API_KEY) return null;

  const repositoryContext = await getRepositoryContext();
  const prompt = buildGeminiPrompt({ message, localResponse, page, context, repositoryContext });
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          topP: 0.9,
          maxOutputTokens: 900,
          responseMimeType: "application/json",
        },
      }),
    },
    8500
  );

  if (!response.ok) return null;
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
  const parsed = safeJsonParse(text);
  if (!parsed || typeof parsed.reply !== "string") return null;

  const reportDraft = parsed.issueBody || localResponse.reportDraft || "";
  return {
    reply: parsed.reply.slice(0, 1200),
    category: parsed.category || localResponse.category,
    confidence: Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(1, parsed.confidence)) : localResponse.confidence,
    createIssue: Boolean(parsed.shouldCreateIssue) && localResponse.createIssue,
    issueTitle: parsed.issueTitle,
    reportDraft,
    actions: sanitizeActions(parsed.actions, localResponse.actions).map((action) => ({
      ...action,
      payload: action.type === "issue_draft" ? reportDraft : action.payload,
    })),
  };
};

const createGitHubIssue = async ({ message, response, page, userAgent }) => {
  if (!process.env.GITHUB_TOKEN || !response.createIssue) return null;

  const titleBase = response.issueTitle || `[Support] ${response.category}: ${message.slice(0, 70)}`;
  const body = [
    response.reportDraft || buildIssueDraft(message, response.category),
    "",
    "---",
    "Created automatically from Mompy Support.",
    `Source page: ${page || "unknown"}`,
    `User agent: ${userAgent || "unknown"}`,
    `Assistant category: ${response.category}`,
    `Assistant confidence: ${response.confidence}`,
  ].join("\n");

  const issueResponse = await fetchWithTimeout(
    `https://api.github.com/repos/${MOMPY_APP_REPO}/issues`,
    {
      method: "POST",
      headers: {
        ...githubHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: titleBase.slice(0, 120),
        body: truncate(body, 12000),
      }),
    },
    7000
  );

  if (!issueResponse.ok) return null;
  const issue = await issueResponse.json();
  return { number: issue.number, url: issue.html_url };
};

const notifyDiscord = async ({ message, response, issue, page }) => {
  if (!process.env.DISCORD_WEBHOOK_URL) return false;

  const fields = [
    { name: "Category", value: response.category || "unclear", inline: true },
    { name: "Confidence", value: String(response.confidence ?? "n/a"), inline: true },
    { name: "Page", value: page || "unknown", inline: false },
  ];

  if (issue?.url) {
    fields.push({ name: "GitHub Issue", value: issue.url, inline: false });
  }

  const payload = {
    username: "Mompy Support",
    embeds: [
      {
        title: "New Mompy support message",
        color: 0x78ff2d,
        fields,
        description: [
          "**User message**",
          truncate(message, 900),
          "",
          "**Assistant reply**",
          truncate(response.reply, 900),
        ].join("\n"),
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const discordResponse = await fetchWithTimeout(
    process.env.DISCORD_WEBHOOK_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    5000
  );

  return discordResponse.ok;
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
  const page = String(body.page || "").slice(0, 500);
  const userAgent = String(body.userAgent || "").slice(0, 300);
  const context = String(body.context || "").slice(0, 100);

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  const localResponse = classifyLocally(message);
  let response = localResponse;
  let source = "local";
  let issue = null;
  let discordNotified = false;

  try {
    const geminiResponse = await callGemini({ message, localResponse, page, context });
    if (geminiResponse) {
      response = geminiResponse;
      source = "gemini";
    }
  } catch {
    response = localResponse;
    source = "local";
  }

  try {
    issue = await createGitHubIssue({ message, response, page, userAgent });
    if (issue?.url) {
      response.reply = `${response.reply}\n\nGitHub issue created: ${issue.url}`;
      response.actions = [
        { label: "View GitHub Issues", type: "external", target: allowedLinks.issues },
        ...response.actions.filter((action) => action.label !== "Open GitHub Issue"),
      ].slice(0, 4);
    }
  } catch {
    issue = null;
  }

  try {
    discordNotified = await notifyDiscord({ message, response, issue, page });
  } catch {
    discordNotified = false;
  }

  return res.status(200).json({
    reply: response.reply,
    category: response.category,
    confidence: response.confidence,
    actions: response.actions,
    reportDraft: response.reportDraft || "",
    meta: {
      source,
      issueUrl: issue?.url || null,
      discordNotified,
    },
  });
};
