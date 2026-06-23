const MOMPY_APP_REPO = "hepter-studios/mompy";
const MOMPY_WEB_REPO = "hepter-studios/mompy-web";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_FALLBACK_MODELS = [
  GEMINI_MODEL,
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
].filter((model, index, list) => model && list.indexOf(model) === index);

const MOMPY_STATIC_CONTEXT = `
Mompy is a retro Python learning console for beginners. It teaches through lessons, missions, a code editor, validation feedback, and locally saved progress.
The app repository is hepter-studios/mompy. The website repository is hepter-studios/mompy-web.
Main product areas: Home, Learn, Python Guide, Demo, Support, Community, Docs, Download, GitHub.
Users can struggle with installation/opening, mission answers, lesson understanding, Python syntax, validation messages, unclear error feedback, downloads, or ideas for improving the app.
When a learner says Mompy keeps saying an answer is wrong without explaining where, treat it as product feedback/feature request unless they clearly report a crash or broken app. Help them describe the expected improvement: line location, expected output, what they typed, the exact mission, and the message Mompy showed.
Support should first help the user understand the problem and ask useful follow-up questions. Escalation to Hepter Studios should happen only when there is enough context or when the user clearly asks to report it.
`;

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

const isPortugueseMessage = (text) =>
  /\b(oi|olá|ola|olhe|bom dia|boa tarde|boa noite|você|voce|tu|não|nao|sem|só|so|estou|testando|teste|conversa|normal|erro|ajuda|instalar|abrir|missão|missao|lição|licao|problema|sugestao|sugestão|pug|coisa|entendi|disse)\b/i.test(
    normalizeText(text)
  );

const isGreetingOnly = (text) =>
  /^(oi|ola|olá|hi|hello|hey|olhe|look|bom dia|boa tarde|boa noite|e ai|e aí)[\s!.?]*$/i.test(normalizeText(text));

const hasBugNegation = (text) =>
  /\b(sem|no|not|não|nao)\s+(bug|erro|crash|problema|problem|issue)\b/i.test(normalizeText(text));

const looksLikeFeedbackSuggestion = (text) =>
  /\b(sugestao|sugestão|melhoria|melhor|dica|explicar|explica|linha|motivo|esperava|deveria|feedback|não é bug|nao e bug|nao eh bug)\b/i.test(
    normalizeText(text)
  );

const wantsEscalation = (text) =>
  /\b(reportar|reporta|manda|mande|enviar|envia|encaminhar|encaminha|github|issue|bug report|open issue|create issue|falar com a equipe|hepter)\b/i.test(
    normalizeText(text)
  );

const hasEnoughIssueContext = (text, history = []) => {
  const combined = normalizeText([...history.map((item) => item.text), text].join("\n"));
  const hasProblem = /\b(erro|error|crash|trava|travou|bug|bugou|nao funciona|não funciona|falha|quebra|quebrado|fecha|tela preta)\b/.test(combined);
  const hasPlace = /\b(missao|missão|lesson|licao|lição|aula|install|instalacao|instalação|abrir|start|run|editor|codigo|código|download)\b/.test(combined);
  const hasDetail = combined.length > 180 || /\b(linha|mensagem|output|saida|saída|mostra|aparece|esperava|deveria|quando|porque|por que)\b/.test(combined);
  return hasProblem && hasPlace && hasDetail;
};

const truncate = (text, max = 12000) => {
  const value = String(text || "");
  return value.length > max ? `${value.slice(0, max)}\n...[truncated]` : value;
};

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-8)
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      text: truncate(String(item?.text || "").trim(), 700),
    }))
    .filter((item) => item.text);
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
    reply: "This sounds like a startup issue. Tell me what happens when you open Mompy: blank screen, crash, error text, or nothing at all?",
    report: true,
    createIssue: false,
    actions: [
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
      { label: "Download Latest Version", type: "external", target: allowedLinks.releases },
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
    ],
  },
  {
    category: "bug",
    confidence: 0.9,
    keywords: ["bug", "error", "crash", "broken", "fail", "not working", "erro", "travou", "quebrado", "falha", "bugou", "nao funciona", "não funciona"],
    reply: "That may be a bug, but I need a little more detail before we report it. What screen or mission were you on, and what did Mompy show?",
    report: true,
    createIssue: false,
    actions: [
      { label: "Open Discussions", type: "external", target: allowedLinks.discussions },
      { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
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
      { label: "Open Learning Path", type: "external", target: allowedLinks.learningPath },
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

const portugueseRouteReplies = {
  installation: "Isso parece problema de instalação. Comece pela documentação, confirme que está usando a versão mais recente e abra uma discussão se ainda falhar.",
  startup: "Isso parece problema para abrir o Mompy. Me diga o que acontece quando você tenta iniciar: tela preta, fecha sozinho, aparece algum texto de erro ou nada acontece?",
  bug: "Pode ser um bug, mas preciso entender melhor antes de reportar. Em qual tela ou missão isso aconteceu, e que mensagem o Mompy mostrou?",
  mission: "Isso parece uma dúvida de missão. Abra a trilha de aprendizado e, se perguntar na comunidade, mande também o número da missão.",
  lesson: "Isso parece uma dúvida de aula. Abra a trilha de aprendizado primeiro; se ainda travar, use a documentação ou a comunidade.",
  "feature request": "Entendi como sugestão. Me conte como você gostaria que o Mompy explicasse melhor o erro da lição: mostrar a linha, o motivo, um exemplo correto ou uma dica passo a passo?",
  documentation: "Isso parece relacionado à documentação. Comece pela seção de docs ou pelo guia de Python.",
  "account/community": "Para conversa rápida, use o Discord. Para perguntas que precisam ficar registradas, use o GitHub Discussions.",
};

const classifyLocally = (message) => {
  const normalized = normalizeText(message);
  const portuguese = isPortugueseMessage(message);

  if (isGreetingOnly(message)) {
    return {
      reply: portuguese
        ? "Oi. Me conta o que aconteceu no Mompy: instalação, erro, missão, aula ou uma ideia? Se puder, diga também em qual tela isso aparece."
        : "Hi. Tell me what happened in Mompy: installation, an error, a mission, a lesson, or an idea? If you can, mention which screen shows it.",
      category: "conversation",
      confidence: 0.45,
      createIssue: false,
      actions: [
        { label: "Read Docs", type: "scroll", target: allowedLinks.docs },
        { label: "Ask Community", type: "external", target: allowedLinks.discord },
      ],
      reportDraft: "",
    };
  }

  const bugNegated = hasBugNegation(message);
  const feedbackSuggestion = looksLikeFeedbackSuggestion(message);
  const route = routes
    .map((item) => ({
      ...item,
      score:
        bugNegated && ["bug", "startup"].includes(item.category)
          ? 0
          : item.keywords.filter((keyword) => normalized.includes(normalizeText(keyword))).length +
            (feedbackSuggestion && item.category === "feature request" ? 2 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.confidence - a.confidence)[0];

  if (!route) {
    return {
      reply: portuguese
        ? "Entendi. Me dá só mais um detalhe: isso é sobre instalar/abrir o Mompy, algum erro, uma aula, uma missão ou uma sugestão?"
        : "I understand. Give me one more detail: is this about installing/opening Mompy, an error, a lesson, a mission, or a suggestion?",
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
    reply: portuguese ? portugueseRouteReplies[route.category] || route.reply : route.reply,
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

const fetchRepoReadme = async (repo, timeoutMs = 1400) => {
  const response = await fetchWithTimeout(`https://api.github.com/repos/${repo}/readme`, {
    headers: githubHeaders(),
  }, timeoutMs);
  if (!response.ok) return "";
  const data = await response.json();
  return Buffer.from(data.content || "", data.encoding === "base64" ? "base64" : "utf8").toString("utf8");
};

const fetchRepoTreeSummary = async (repo, timeoutMs = 1400) => {
  const response = await fetchWithTimeout(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`, {
    headers: githubHeaders(),
  }, timeoutMs);
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
  if (repositoryContextCache && now - repositoryContextTime < 30 * 60 * 1000) {
    return repositoryContextCache;
  }

  try {
    const [appReadmeResult, appTreeResult, webReadmeResult] = await Promise.allSettled([
      fetchRepoReadme(MOMPY_APP_REPO, 1300),
      fetchRepoTreeSummary(MOMPY_APP_REPO, 1300),
      fetchRepoReadme(MOMPY_WEB_REPO, 1300),
    ]);
    const appReadme = appReadmeResult.status === "fulfilled" ? appReadmeResult.value : "";
    const appTree = appTreeResult.status === "fulfilled" ? appTreeResult.value : "";
    const webReadme = webReadmeResult.status === "fulfilled" ? webReadmeResult.value : "";

    repositoryContextCache = truncate(
      [
        "Fast Mompy product context:",
        MOMPY_STATIC_CONTEXT.trim(),
        "",
        "Mompy app repository context:",
        truncate(appReadme, 1300),
        "",
        "Mompy app relevant file map:",
        truncate(appTree, 700),
        "",
        "Mompy website repository context:",
        truncate(webReadme, 700),
      ].join("\n"),
      3600
    );
    repositoryContextTime = now;
    return repositoryContextCache;
  } catch {
    return MOMPY_STATIC_CONTEXT;
  }
};

const buildGeminiPrompt = ({ message, localResponse, page, context, repositoryContext, history }) => `
You are Mompy Support, the human-like support assistant for Mompy.

Mission: talk naturally with the user, understand the problem, help solve it, and collect useful details for the Mompy team. Always answer in the user's language. If the user writes Portuguese, use Brazilian Portuguese. If the user switches language, follow them.

Mompy: a retro Python learning console for beginners with lessons, missions, a code editor, validation feedback, local progress, docs, support, community, releases, and GitHub issues/discussions.

Behavior:
- Be conversational, not a dead form.
- Do not start every answer with "Olá", "Oi", or "Hi". Greet only when the user's latest message is only a greeting.
- If the user is confused, acknowledge it, correct yourself, and explain in simple words.
- For greetings or vague messages, ask one warm, specific follow-up question.
- Help with installation, opening/running the app, lessons, missions, Python beginner concepts, bugs, ideas, docs, community, and downloads.
- Try to solve or narrow the problem before routing. Give practical next steps the user can try now.
- Do not expose secrets, tokens, webhook URLs, private config, or internal implementation details.
- Do not say an issue was created unless the backend later adds the issue URL.
- The backend may notify Discord internally for triage; do not mention that to the user unless a GitHub issue URL is actually returned.
- Do not classify "sem bug", "no bug", "not a bug", "sem erro", or "no error" as a bug.
- If the user says it is a suggestion, feedback, "não é bug", "não é um bug de verdade", or talks about improving lesson/error feedback, classify as "feature request", not "bug".
- For lesson validation feedback complaints, explain that the useful details are: mission number, code typed, exact message Mompy showed, and what feedback they expected. Suggest better feedback ideas such as line location, expected output, and a small hint.
- Set shouldCreateIssue true only after enough concrete details exist: what screen/mission, what happened, what should have happened, and how to reproduce it. Otherwise ask for details.
- If you will suggest reporting, say it clearly as optional: "Posso encaminhar isso para a equipe da Hepter Studios quando você me der esses detalhes." Never imply that reporting alone solves the user's immediate problem.

Links:
Docs ${allowedLinks.docs}
Learn ${allowedLinks.learningPath}
Python guide ${allowedLinks.pythonGuide}
Issues ${allowedLinks.issues}
Discussions ${allowedLinks.discussions}
Discord ${allowedLinks.discord}
Releases ${allowedLinks.releases}

Mompy knowledge:
${repositoryContext}

Conversation so far:
${history.map((item) => `${item.role}: ${item.text}`).join("\n") || "none"}

Local hint: category=${localResponse.category}, confidence=${localResponse.confidence}, createIssue=${localResponse.createIssue}
Page: ${page || "unknown"} / section ${context || "unknown"}
Latest user message: ${message}

Return strict JSON only, with no markdown:
{
  "reply": "clear conversational support response, 1-3 short paragraphs max",
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

const parseGeminiResponse = async (response, localResponse, message, history) => {
  let data;
  try {
    data = await response.json();
  } catch {
    return { response: null, reason: "invalid_json" };
  }

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
  const parsed = safeJsonParse(text);
  if (!parsed || typeof parsed.reply !== "string") {
    const plainReply = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    if (!plainReply) return { response: null, reason: "parse_failed" };

    return {
      response: {
        reply: plainReply.slice(0, 1200),
        category: localResponse.category,
        confidence: Math.max(localResponse.confidence || 0.5, 0.55),
        createIssue: false,
        issueTitle: "",
        reportDraft: localResponse.reportDraft || "",
        actions: localResponse.actions,
      },
      reason: "text_fallback",
    };
  }

  const reportDraft = parsed.issueBody || localResponse.reportDraft || "";
  const category = parsed.category || localResponse.category;
  const issueEligibleCategory = ["bug", "startup", "installation"].includes(normalizeText(category));
  const escalationReady = wantsEscalation(message) || hasEnoughIssueContext(message, history);

  return {
    response: {
      reply: parsed.reply.slice(0, 1200),
      category,
      confidence: Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(1, parsed.confidence)) : localResponse.confidence,
      createIssue: Boolean(parsed.shouldCreateIssue) && issueEligibleCategory && escalationReady,
      issueTitle: parsed.issueTitle,
      reportDraft,
      actions: sanitizeActions(parsed.actions, localResponse.actions).map((action) => ({
        ...action,
        payload: action.type === "issue_draft" ? reportDraft : action.payload,
      })),
    },
    reason: "ok",
  };
};

const callGemini = async ({ message, localResponse, page, context, history }) => {
  if (!process.env.GEMINI_API_KEY) {
    return {
      response: null,
      diagnostic: { configured: false, ok: false, reason: "missing_env" },
    };
  }

  const failures = [];
  let repositoryContext = MOMPY_STATIC_CONTEXT;
  try {
    repositoryContext = await getRepositoryContext();
  } catch {
    repositoryContext = MOMPY_STATIC_CONTEXT;
  }
  const prompt = buildGeminiPrompt({ message, localResponse, page, context, repositoryContext, history });

  for (const model of GEMINI_FALLBACK_MODELS) {
    try {
      const geminiResponse = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.45,
              topP: 0.9,
              maxOutputTokens: 700,
              responseMimeType: "application/json",
            },
          }),
        },
        8000
      );

      if (!geminiResponse.ok) {
        failures.push(`${model}:http_${geminiResponse.status}`);
        if (![401, 403].includes(geminiResponse.status)) continue;
        break;
      }

      const parsed = await parseGeminiResponse(geminiResponse, localResponse, message, history);
      if (parsed.response) {
        return {
          response: parsed.response,
          diagnostic: { configured: true, ok: true, reason: "ok", model, failures },
        };
      }

      failures.push(`${model}:${parsed.reason}`);
    } catch (error) {
      failures.push(`${model}:${error?.name === "AbortError" ? "timeout" : "request_failed"}`);
    }
  }

  return {
    response: null,
    diagnostic: {
      configured: true,
      ok: false,
      model: null,
      reason: failures.at(-1)?.split(":").slice(1).join(":") || "no_model_response",
      failures,
    },
  };
};

const createGitHubIssue = async ({ message, response, page, userAgent }) => {
  if (!process.env.GITHUB_TOKEN) {
    return { issue: null, diagnostic: { configured: false, ok: false, reason: "missing_env" } };
  }

  if (!response.createIssue) {
    return { issue: null, diagnostic: { configured: true, ok: false, reason: "not_needed" } };
  }

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

  if (!issueResponse.ok) {
    return { issue: null, diagnostic: { configured: true, ok: false, reason: `http_${issueResponse.status}` } };
  }

  const issue = await issueResponse.json();
  return {
    issue: { number: issue.number, url: issue.html_url },
    diagnostic: { configured: true, ok: true, reason: "created" },
  };
};

const notifyDiscord = async ({ message, response, issue, page }) => {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    return { notified: false, diagnostic: { configured: false, ok: false, reason: "missing_env" } };
  }

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

  return {
    notified: discordResponse.ok,
    diagnostic: {
      configured: true,
      ok: discordResponse.ok,
      reason: discordResponse.ok ? "sent" : `http_${discordResponse.status}`,
    },
  };
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
  const history = sanitizeHistory(body.history);

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  let localResponse = classifyLocally(message);
  if (isGreetingOnly(message) && history.length > 1) {
    localResponse = {
      ...localResponse,
      reply: isPortugueseMessage(message)
        ? "Estou aqui. Me diz em uma frase o que você quer fazer agora no Mompy, ou qual parte ficou confusa."
        : "I'm here. Tell me in one sentence what you want to do next in Mompy, or which part felt confusing.",
    };
  }
  const escalationReady = wantsEscalation(message) || hasEnoughIssueContext(message, history);
  let response = localResponse;
  let source = "local";
  let issue = null;
  let discordNotified = false;
  let geminiDiagnostic = { configured: Boolean(process.env.GEMINI_API_KEY), ok: false, reason: "not_called" };
  let githubDiagnostic = { configured: Boolean(process.env.GITHUB_TOKEN), ok: false, reason: "not_needed" };
  let discordDiagnostic = { configured: Boolean(process.env.DISCORD_WEBHOOK_URL), ok: false, reason: "not_called" };

  try {
    const geminiResult = await callGemini({ message, localResponse, page, context, history });
    geminiDiagnostic = geminiResult?.diagnostic || geminiDiagnostic;
    if (geminiResult?.response) {
      response = geminiResult.response;
      source = "gemini";
    }
  } catch (error) {
    geminiDiagnostic = {
      configured: Boolean(process.env.GEMINI_API_KEY),
      ok: false,
      reason: error?.name === "AbortError" ? "timeout" : "exception",
    };
    response = localResponse;
    source = "local";
  }

  if (!escalationReady && ["bug", "startup", "installation"].includes(normalizeText(response.category))) {
    response.createIssue = false;
  }

  try {
    const githubResult = await createGitHubIssue({ message, response, page, userAgent });
    issue = githubResult?.issue || null;
    githubDiagnostic = githubResult?.diagnostic || githubDiagnostic;
    if (issue?.url) {
      response.reply = isPortugueseMessage(message)
        ? `${response.reply}\n\nEncaminhei isso para a equipe da Hepter Studios com os detalhes da conversa: ${issue.url}`
        : `${response.reply}\n\nI sent this to the Hepter Studios team with the conversation details: ${issue.url}`;
      response.actions = [
        { label: "View GitHub Issues", type: "external", target: allowedLinks.issues },
        ...response.actions.filter((action) => action.label !== "Open GitHub Issue"),
      ].slice(0, 4);
    }
  } catch (error) {
    githubDiagnostic = {
      configured: Boolean(process.env.GITHUB_TOKEN),
      ok: false,
      reason: error?.name === "AbortError" ? "timeout" : "exception",
    };
    issue = null;
  }

  try {
    const discordResult = await notifyDiscord({ message, response, issue, page });
    discordNotified = Boolean(discordResult?.notified);
    discordDiagnostic = discordResult?.diagnostic || discordDiagnostic;
  } catch (error) {
    discordDiagnostic = {
      configured: Boolean(process.env.DISCORD_WEBHOOK_URL),
      ok: false,
      reason: error?.name === "AbortError" ? "timeout" : "exception",
    };
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
      env: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        github: Boolean(process.env.GITHUB_TOKEN),
        discord: Boolean(process.env.DISCORD_WEBHOOK_URL),
      },
      diagnostics: {
        gemini: geminiDiagnostic,
        github: githubDiagnostic,
        discord: discordDiagnostic,
      },
    },
  });
};
