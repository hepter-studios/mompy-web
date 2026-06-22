const docsLinks = {
  website: "https://mompy.co",
  github: "https://github.com/hepter-studios/mompy",
  releases: "https://github.com/hepter-studios/mompy/releases",
  download: "https://github.com/hepter-studios/mompy/releases/download/v0.1.1/MompySetup-v0.1.1.exe",
  latestRelease: "https://github.com/hepter-studios/mompy/releases/tag/v0.1.1",
  installer: "https://github.com/hepter-studios/mompy/releases/download/v0.1.1/MompySetup-v0.1.1.exe",
  portableZip: "https://github.com/hepter-studios/mompy/releases/download/v0.1.1/Mompy-windows-x64.zip",
  issues: "https://github.com/hepter-studios/mompy/issues",
  newIssue: "https://github.com/hepter-studios/mompy/issues/new",
  discussions: "https://github.com/hepter-studios/mompy/discussions",
  discord: "https://discord.gg/fqxvyGFyfa",
  sponsor: "https://github.com/sponsors/macksonvictor",
  learn: "learn.html",
  support: "index.html#support",
  license: "https://github.com/hepter-studios/mompy/blob/main/LICENSE",
  contributing: "https://github.com/hepter-studios/mompy/blob/main/CONTRIBUTING.md",
  security: "https://github.com/hepter-studios/mompy/blob/main/SECURITY.md",
};

const docsQuickLinks = [
  { label: "Download", url: docsLinks.releases, type: "release" },
  { label: "Report a Problem", url: docsLinks.issues, type: "issue" },
  { label: "Discussions", url: docsLinks.discussions, type: "community" },
  { label: "Contribute", url: docsLinks.github, type: "project" },
];

const docsCommands = {
  install: {
    label: "Install dependencies",
    code: "python -m pip install -r requirements.txt",
  },
  desktop: {
    label: "Run desktop app",
    code: "python main.py",
  },
  check: {
    label: "Check backend startup",
    code: "python main.py --check",
  },
  preview: {
    label: "Run browser preview",
    code: "python main.py --serve --port 8770\n# then open http://127.0.0.1:8770/frontend/index.html",
  },
  tests: {
    label: "Run backend tests",
    code: "python -m unittest discover -s tests",
  },
  jsCheck: {
    label: "Check frontend JavaScript",
    code: "node --check frontend/js/app.js",
  },
  buildZip: {
    label: "Build Windows zip",
    code: "powershell -ExecutionPolicy Bypass -File scripts/build_windows.ps1 -Zip",
  },
  buildInstaller: {
    label: "Build Windows installer",
    code: "powershell -ExecutionPolicy Bypass -File scripts/build_windows_installer.ps1 -SkipAppBuild",
  },
};

const docsScreenshots = [
  {
    title: "Start screen",
    src: "assets/media/mompy-start-screen.webp",
    alt: "Mompy start screen",
  },
  {
    title: "First access",
    src: "assets/media/mompy-first-access.webp",
    alt: "Mompy first access screen",
  },
  {
    title: "Mission editor",
    src: "assets/media/mompy-mission-editor.webp",
    alt: "Mompy mission editor",
  },
  {
    title: "Guided lesson",
    src: "assets/media/mompy-lesson-mission.webp",
    alt: "Mompy guided lesson screen",
  },
  {
    title: "Preview grid",
    src: "assets/media/mompy-preview-grid.webp",
    alt: "Mompy interface preview grid",
  },
];

const troubleshootingItems = [
  {
    problem: "App does not open",
    symptoms: "The executable starts and closes, or nothing appears.",
    steps: ["Use the latest Windows release.", "Try the installer before the portable zip.", "Open a report with OS, Mompy version, and screenshots or logs."],
    actions: [
      { label: "Open Mompy Support", url: docsLinks.support },
      { label: "Open GitHub Issue", url: docsLinks.newIssue },
    ],
  },
  {
    problem: "Installer issues",
    symptoms: "Windows blocks, interrupts, or fails the install.",
    steps: ["Download only from GitHub Releases.", "Avoid executables sent through comments or mirrors.", "Attach the installer error message to your report."],
    actions: [
      { label: "Releases", url: docsLinks.releases },
      { label: "Report a Problem", url: docsLinks.issues },
    ],
  },
  {
    problem: "Portable zip issues",
    symptoms: "The zip runs from the wrong folder, misses files, or does not update cleanly.",
    steps: ["Extract the full zip before running Mompy.", "Replace the whole extracted folder when updating.", "Report missing files with the zip version."],
    actions: [
      { label: "Download Zip", url: docsLinks.portableZip },
      { label: "Discussions", url: docsLinks.discussions },
    ],
  },
  {
    problem: "Python/source setup issues",
    symptoms: "A source checkout cannot install dependencies or run main.py.",
    steps: ["Create a virtual environment.", "Install requirements.txt.", "Run python main.py --check before the desktop app."],
    actions: [
      { label: "Contributing", url: docsLinks.contributing },
      { label: "Open Discussions", url: docsLinks.discussions },
    ],
  },
];

const supportReportTemplate = `## Problem
Describe what happened.

## Steps To Reproduce
1. Open Mompy.
2. Click ...
3. See ...

## Expected Result
Describe what should have happened.

## Environment
- OS:
- Mompy version:
- Installer, portable zip or source:

## Attachments
Add screenshots, GIFs or logs when useful.`;

const docsSections = [
  {
    id: "overview",
    category: "Overview",
    title: "Overview",
    description: "What Mompy is, who it is for, and what is available today.",
    tags: ["what is mompy", "current status", "active development", "windows", "local-first"],
    blocks: [
      { type: "heading", text: "What is Mompy?" },
      { type: "p", text: "Mompy is a retro learning console for Python programming. It is a focused desktop experience where beginners practice real code through lessons, missions, progress, feedback, and challenges." },
      { type: "p", text: "Mompy is local-first: profile, progress, XP, mission data, validation, and app behavior are handled by the local Python app rather than requiring an online account." },
      { type: "callout", variant: "active", title: "Active development", text: "Mompy is still evolving. The current release is usable, but lessons, missions, animations, feedback, platform support, and the overall learning experience are being improved over time." },
      { type: "list", title: "Available now", items: ["Windows installer and Windows portable zip in GitHub Releases.", "Guided lessons, 30 beginner missions, progress, XP, and local backend validation.", "Python desktop app powered by pywebview with HTML/CSS/JavaScript frontend."] },
      { type: "list", title: "Still improving", items: ["Teaching flow and mission design.", "Animation timing, feedback quality, and app/game feel.", "Future macOS and Linux packages."] },
    ],
  },
  {
    id: "getting-started",
    category: "Getting Started",
    title: "Getting Started",
    description: "Install Mompy, launch it, and understand how updates work.",
    tags: ["download", "installer", "portable zip", "windows", "progress", "update"],
    blocks: [
      { type: "heading", text: "Download Mompy" },
      { type: "p", text: "The current public release is Mompy v0.1.1. Official builds are distributed through GitHub Releases." },
      {
        type: "cards",
        items: [
          { title: "Windows installer", text: "Recommended for most Windows users.", linkLabel: "Download setup", url: docsLinks.installer },
          { title: "Portable zip", text: "Use when you prefer an extracted folder.", linkLabel: "Download zip", url: docsLinks.portableZip },
          { title: "Release page", text: "See all attached assets and release notes.", linkLabel: "Open Releases", url: docsLinks.releases },
        ],
      },
      { type: "note", title: "Updating Mompy", text: "Installer users can download and run the newest Windows installer. Portable users should download the newest zip and replace the extracted folder. Local profile/progress data is intended to stay local." },
      { type: "list", title: "First launch", items: ["Download from the official release page.", "Run the installer or extract the portable zip.", "Open Mompy and start the first mission block.", "Use GitHub Issues or Discord if the app does not open."] },
    ],
  },
  {
    id: "learning-flow",
    category: "Learning Flow",
    title: "Learning Flow",
    description: "How lessons, missions, feedback, progress, and XP fit together.",
    tags: ["lessons", "missions", "xp", "progress", "feedback", "blocks"],
    blocks: [
      { type: "p", text: "Mompy starts with a guided lesson before each block of missions, then asks the learner to practice only concepts that were introduced earlier." },
      { type: "callout", variant: "note", title: "Learning content lives in /learn", text: "Docs explain how Mompy works. For Python learning examples and topic reference, use the Learn page." },
      {
        type: "table",
        headers: ["Block", "Missions", "Topic", "Concepts"],
        rows: [
          ["01", "01-05", "First Commands", "print, strings, quotes, parentheses, terminal output"],
          ["02", "06-10", "Variables and Values", "variables, assignment, strings, numbers, printing variables"],
          ["03", "11-15", "Decisions", "booleans, if, else, comparisons, indentation"],
          ["04", "16-20", "Repetition", "for, range, loops, loop variable, indentation"],
          ["05", "21-25", "Lists", "lists, indexes, items, iteration"],
          ["06", "26-30", "Functions", "def, function calls, parameters, return"],
        ],
      },
      { type: "linkRow", links: [{ label: "Open Learn", url: docsLinks.learn }, { label: "Mission path", url: "learn.html#mission-path" }] },
    ],
  },
  {
    id: "using-the-app",
    category: "Using the App",
    title: "Using the App",
    description: "The screens and behaviors learners interact with inside Mompy.",
    tags: ["mission screen", "guided lesson", "code editor", "validation", "profile", "screenshots"],
    blocks: [
      { type: "p", text: "Mompy uses a CRT-style desktop interface with a mission screen, guided lesson screen, code editor, validation feedback, and profile/progress state." },
      { type: "list", title: "Core areas", items: ["Mission screen: the main place to read goals and write code.", "Guided lesson screen: explains the next concept before missions require it.", "Code editor: where learners type Python.", "Validation: Python backend checks mission answers.", "Profile and progress: XP, level, and completed missions are handled locally."] },
      { type: "screenshots", items: docsScreenshots },
    ],
  },
  {
    id: "troubleshooting",
    category: "Troubleshooting",
    title: "Troubleshooting",
    description: "Find the right help path and write useful bug reports.",
    tags: ["support", "bug", "error", "installer", "zip", "issue", "report"],
    blocks: [
      { type: "p", text: "Support currently happens through GitHub and the Mompy Discord community. Before opening a new issue, check if a similar one already exists." },
      { type: "troubleshooting", items: troubleshootingItems },
      { type: "heading", text: "Good report template" },
      { type: "code", command: { label: "GitHub issue template", code: supportReportTemplate } },
      { type: "callout", variant: "warning", title: "Private information", text: "Do not post passwords, tokens, private files, or personal information in public issues. Security-sensitive reports should follow the security policy." },
      { type: "linkRow", links: [{ label: "Open Mompy Support", url: docsLinks.support }, { label: "Open GitHub Issue", url: docsLinks.newIssue }, { label: "Join Discord", url: docsLinks.discord }, { label: "Open Discussions", url: docsLinks.discussions }] },
    ],
  },
  {
    id: "development",
    category: "Development",
    title: "Development",
    description: "Run Mompy from source, preview the frontend, test, and package builds.",
    tags: ["architecture", "frontend", "backend", "source", "tests", "packaging", "pywebview"],
    blocks: [
      { type: "p", text: "Mompy is a Python desktop app with an HTML/CSS/JavaScript frontend. The app logic, mission data, validation, progress, XP, and desktop shell are Python." },
      {
        type: "tree",
        code: `mompy/
  frontend/
    index.html
    css/
    js/
    assets/
  backend/
    api.py
    code_runner.py
    lessons.py
    missions.py
    profile.py
    progress.py
    validator.py
    xp.py
  tests/
  scripts/
    build_windows.ps1
  main.py
  requirements.txt`,
      },
      { type: "code", command: docsCommands.install },
      { type: "code", command: docsCommands.desktop },
      { type: "code", command: docsCommands.check },
      { type: "code", command: docsCommands.preview },
      { type: "code", command: docsCommands.tests },
      { type: "code", command: docsCommands.jsCheck },
      { type: "code", command: docsCommands.buildZip },
      { type: "code", command: docsCommands.buildInstaller },
      { type: "note", title: "Generated builds", text: "Do not commit generated builds, installers, virtual environments, temporary files, or local progress data. Attach tested packages to GitHub Releases." },
    ],
  },
  {
    id: "contributing",
    category: "Contributing",
    title: "Contributing",
    description: "Where to help and how to keep changes focused.",
    tags: ["contributing", "pull request", "lessons", "missions", "documentation", "packaging"],
    blocks: [
      {
        type: "cards",
        items: [
          { title: "Lessons", text: "Clearer explanations, better sequencing, missing examples.", linkLabel: "Discuss", url: docsLinks.discussions },
          { title: "Missions", text: "Beginner-safe challenges, validation fixes, improved feedback.", linkLabel: "Open Issues", url: docsLinks.issues },
          { title: "Python backend", text: "Validation, progress, XP, safe execution, and tests.", linkLabel: "GitHub", url: docsLinks.github },
          { title: "Interface", text: "Small polish, accessibility, layout fixes, and visual consistency.", linkLabel: "GitHub", url: docsLinks.github },
          { title: "Packaging", text: "Windows installer improvements and future macOS/Linux packages.", linkLabel: "Contribute", url: docsLinks.contributing },
          { title: "Documentation", text: "Setup notes, troubleshooting, release instructions, and screenshots.", linkLabel: "Contribute", url: docsLinks.contributing },
        ],
      },
      { type: "list", title: "Pull request rules", items: ["Keep the change focused.", "Explain what changed and why.", "Preserve the CRT/industrial visual identity unless discussed first.", "Do not add online accounts, passwords, telemetry, cloud sync, or server dependencies without an approved plan.", "Test the app locally before submitting."] },
      { type: "callout", variant: "note", title: "Learning design rule", text: "No mission should require a concept that has not already been introduced in a guided lesson." },
    ],
  },
  {
    id: "security",
    category: "Security",
    title: "Security",
    description: "How Mompy treats local-first safety and vulnerability reports.",
    tags: ["security", "vulnerability", "local-first", "release verification", "dependencies"],
    blocks: [
      { type: "callout", variant: "security", title: "Do not post serious security problems publicly", text: "Use the safest private contact path available through the GitHub repository or Hepter Studio channels. If private GitHub security advisories are enabled, use them." },
      { type: "list", title: "High-priority reports", items: ["Unsafe learner-code execution.", "Access to local files outside expected limits.", "Installer or release package tampering.", "Dependency vulnerabilities with practical impact.", "Exposed tokens, credentials, or private files."] },
      { type: "list", title: "Local-first security goals", items: ["Avoid online accounts by default.", "Store profile and progress locally.", "Avoid sending learner progress to external services.", "Avoid telemetry by default.", "Keep user code execution isolated from the UI process where possible."] },
      { type: "note", title: "Release verification", text: "Official builds should be attached to GitHub Releases and matched to the source state used to create them. Do not trust executable files sent through issues, comments, or unofficial mirrors." },
      { type: "linkRow", links: [{ label: "Security Policy", url: docsLinks.security }, { label: "Releases", url: docsLinks.releases }] },
    ],
  },
  {
    id: "roadmap",
    category: "Roadmap",
    title: "Roadmap",
    description: "What exists now and what is planned without fake dates.",
    tags: ["roadmap", "windows", "macos", "linux", "planned", "active development"],
    blocks: [
      {
        type: "table",
        headers: ["Area", "Status"],
        rows: [
          ["Windows installer", "Available in Releases"],
          ["Windows portable zip", "Available in Releases"],
          ["macOS package", "Planned"],
          ["Linux package", "Planned"],
          ["More lessons and missions", "Planned"],
          ["Animations, teaching flow, feedback, and app/game feel", "Improving over time"],
        ],
      },
      { type: "callout", variant: "planned", title: "No fixed dates yet", text: "Mompy should improve steadily without promising release dates before the work is tested." },
    ],
  },
  {
    id: "official-links",
    category: "Official Links",
    title: "Official Links",
    description: "Trusted Mompy destinations.",
    tags: ["links", "github", "releases", "issues", "discord", "sponsor", "learn"],
    blocks: [
      {
        type: "cards",
        items: [
          { title: "Website", text: "Main Mompy website.", linkLabel: "Open Website", url: docsLinks.website },
          { title: "GitHub Repository", text: "Source, issues, discussions, and project files.", linkLabel: "Open GitHub", url: docsLinks.github },
          { title: "Releases", text: "Official download page.", linkLabel: "Open Releases", url: docsLinks.releases },
          { title: "Issues", text: "Bugs, reproducible problems, and feature requests.", linkLabel: "Open Issues", url: docsLinks.issues },
          { title: "Discussions", text: "Ideas, questions, and broader conversations.", linkLabel: "Open Discussions", url: docsLinks.discussions },
          { title: "Discord", text: "Community chat and quick questions.", linkLabel: "Join Discord", url: docsLinks.discord },
          { title: "Sponsor", text: "Support Mompy development.", linkLabel: "Sponsor", url: docsLinks.sponsor },
          { title: "Learn", text: "Python learning topics and mission path.", linkLabel: "Open Learn", url: docsLinks.learn },
          { title: "License", text: "Mompy is source-visible, not currently open-source licensed.", linkLabel: "Read License", url: docsLinks.license },
        ],
      },
    ],
  },
];

window.MOMPY_DOCS = {
  docsLinks,
  docsQuickLinks,
  docsSections,
  docsCommands,
};
