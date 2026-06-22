(() => {
const { docsSections, docsLinks } = window.MOMPY_DOCS;

document.querySelectorAll("[data-docs-link]").forEach((link) => {
  const key = link.dataset.docsLink;
  if (docsLinks[key]) link.href = docsLinks[key];
});

const externalize = (url) => /^https?:\/\//i.test(url);
const escapeDocsHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const docsContent = document.querySelector("[data-docs-content]");
const docsSidebar = document.querySelector("[data-docs-sidebar]");
const docsToc = document.querySelector("[data-docs-toc]");
const docsSearchForm = document.querySelector("[data-docs-search]");
const docsSearchInput = document.querySelector("[data-docs-search-input]");

const renderLinkAttrs = (url) => externalize(url) ? ' target="_blank" rel="noopener noreferrer"' : "";

const renderCommand = (command) => `
  <div class="docs-code">
    <div class="docs-code__bar">
      <span>${command.label}</span>
      <button type="button" data-docs-copy aria-label="Copy ${command.label} command">Copy</button>
    </div>
    <pre tabindex="0"><code data-raw-code="${encodeURIComponent(command.code)}">${escapeDocsHtml(command.code)}</code></pre>
  </div>
`;

const renderBlock = (block) => {
  if (block.type === "heading") return `<h3>${block.text}</h3>`;
  if (block.type === "p") return `<p>${block.text}</p>`;
  if (block.type === "note") return `<div class="docs-callout is-note"><strong>${block.title}</strong><p>${block.text}</p></div>`;
  if (block.type === "callout") return `<div class="docs-callout is-${block.variant}"><strong>${block.title}</strong><p>${block.text}</p></div>`;
  if (block.type === "code") return renderCommand(block.command);
  if (block.type === "tree") return renderCommand({ label: "Project structure", code: block.code });
  if (block.type === "list") {
    return `
      <div class="docs-list">
        <h3>${block.title}</h3>
        <ul>${block.items.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    `;
  }
  if (block.type === "cards") {
    return `
      <div class="docs-card-grid">
        ${block.items.map((item) => `
          <article class="docs-card">
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <a href="${item.url}"${renderLinkAttrs(item.url)}>${item.linkLabel}</a>
          </article>
        `).join("")}
      </div>
    `;
  }
  if (block.type === "table") {
    return `
      <div class="docs-table-wrap">
        <table class="docs-table">
          <thead><tr>${block.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
          <tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    `;
  }
  if (block.type === "screenshots") {
    return `
      <div class="docs-screenshots">
        ${block.items.map((item) => `
          <figure>
            <img src="${item.src}" alt="${item.alt}" loading="lazy" />
            <figcaption>${item.title}</figcaption>
          </figure>
        `).join("")}
      </div>
    `;
  }
  if (block.type === "troubleshooting") {
    return `
      <div class="docs-troubleshooting">
        ${block.items.map((item) => `
          <article>
            <h3>${item.problem}</h3>
            <p>${item.symptoms}</p>
            <ul>${item.steps.map((step) => `<li>${step}</li>`).join("")}</ul>
            <div>${item.actions.map((action) => `<a href="${action.url}"${renderLinkAttrs(action.url)}>${action.label}</a>`).join("")}</div>
          </article>
        `).join("")}
      </div>
    `;
  }
  if (block.type === "linkRow") {
    return `<div class="docs-link-row">${block.links.map((link) => `<a href="${link.url}"${renderLinkAttrs(link.url)}>${link.label}</a>`).join("")}</div>`;
  }
  return "";
};

const getSearchText = (section) => [
  section.title,
  section.category,
  section.description,
  section.tags.join(" "),
  JSON.stringify(section.blocks),
].join(" ").toLowerCase();

const renderDocs = () => {
  docsSidebar.innerHTML = docsSections
    .map((section) => `<a href="#${section.id}" data-docs-nav="${section.id}">${section.category}</a>`)
    .join("");

  if (docsToc) {
    docsToc.innerHTML = docsSections
      .map((section) => `<a href="#${section.id}" data-docs-toc-link="${section.id}">${section.title}</a>`)
      .join("");
  }

  docsContent.innerHTML = docsSections
    .map((section) => `
      <section id="${section.id}" class="docs-section" data-docs-section data-docs-search-text="${escapeDocsHtml(getSearchText(section))}">
        <div class="docs-section__head">
          <span>${section.category}</span>
          <h2>${section.title}</h2>
          <p>${section.description}</p>
        </div>
        ${section.blocks.map(renderBlock).join("")}
      </section>
    `)
    .join("");
};

renderDocs();

document.querySelectorAll(".docs-card a, .docs-troubleshooting a, .docs-link-row a, .docs-footer a, .docs-hero__actions a").forEach((link) => {
  const rawHref = link.getAttribute("href") || "";
  if (externalize(rawHref)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
});

document.querySelectorAll("[data-docs-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".docs-code")?.querySelector("code");
    const raw = code ? decodeURIComponent(code.dataset.rawCode || "") : "";
    try {
      await navigator.clipboard.writeText(raw);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    } catch {
      button.textContent = "Select";
    }
  });
});

const normalizeDocsQuery = (value) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const filterDocs = () => {
  const terms = normalizeDocsQuery(docsSearchInput?.value || "").split(/\s+/).filter(Boolean);
  let visible = 0;
  document.querySelectorAll("[data-docs-section]").forEach((section) => {
    const text = normalizeDocsQuery(section.dataset.docsSearchText || "");
    const match = !terms.length || terms.every((term) => text.includes(term));
    section.hidden = !match;
    if (match) visible += 1;
  });
  document.body.dataset.docsFiltering = terms.length ? "true" : "false";
  return visible;
};

docsSearchInput?.addEventListener("input", filterDocs);
docsSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const visible = filterDocs();
  const target = document.querySelector("[data-docs-section]:not([hidden])");
  if (target && visible) target.scrollIntoView({ behavior: "smooth", block: "start" });
});

const setActiveDocsSection = (id) => {
  document.querySelectorAll("[data-docs-nav], [data-docs-toc-link]").forEach((link) => {
    const active = link.dataset.docsNav === id || link.dataset.docsTocLink === id;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveDocsSection(visible.target.id);
    },
    { rootMargin: "-20% 0px -58% 0px", threshold: [0.18, 0.3, 0.48] }
  );
  document.querySelectorAll("[data-docs-section]").forEach((section) => observer.observe(section));
} else {
  setActiveDocsSection(docsSections[0].id);
}
})();
