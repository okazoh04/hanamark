// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors

/**
 * テーマ JSON を CSS カスタムプロパティとして document.documentElement に適用する
 * @param {Object} theme
 */
function applyTheme(theme) {
  const root = document.documentElement;
  const set = (name, val) => val && root.style.setProperty(name, val);

  set("--hm-bg",               theme.bg);
  set("--hm-text",             theme.text);
  set("--hm-accent",           theme.accent);

  if (theme.h1) {
    set("--hm-h1-bg",          theme.h1.background);
    set("--hm-h1-color",       theme.h1.color);
    set("--hm-h1-border",      theme.h1.border);
  }
  if (theme.h2) {
    set("--hm-h2-bg",          theme.h2.background);
    set("--hm-h2-color",       theme.h2.color);
    set("--hm-h2-underline",   theme.h2.underline);
  }
  if (theme.h3) {
    set("--hm-h3-color",       theme.h3.color);
    set("--hm-h3-underline",   theme.h3.underline);
  }
  if (theme.table) {
    set("--hm-table-header",       theme.table.header);
    set("--hm-table-header-color", theme.table.headerColor);
    set("--hm-table-stripe",       theme.table.stripe);
    set("--hm-table-hover",        theme.table.hover);
    set("--hm-table-border",       theme.table.border);
  }
  if (theme.code) {
    set("--hm-code-bg",     theme.code.bg);
    set("--hm-code-border", theme.code.border);
    set("--hm-code-text",   theme.code.text);
  }
  if (theme.quote) {
    set("--hm-quote-border", theme.quote.border);
    set("--hm-quote-bg",     theme.quote.bg);
  }
  if (theme.link) {
    set("--hm-link-color", theme.link.color);
    set("--hm-link-hover", theme.link.hover);
  }
  if (theme.bullet) {
    root.style.setProperty("--hm-bullet", `"${theme.bullet}"`);
  }
}

/**
 * HTML をコンテンツ領域に挿入してハイライトを適用する
 * @param {string} html
 */
function renderContent(html) {
  const content = document.getElementById("content");
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.style.display = "none";

  const scrollTop = window.scrollY;
  content.innerHTML = html;

  if (typeof hljs !== "undefined") {
    content.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }

  addCopyButtons(content);
  window.scrollTo(0, scrollTop);
}

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

function addCopyButtons(container) {
  container.querySelectorAll("pre").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.innerHTML = COPY_ICON;
    btn.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      const text = code ? code.innerText : pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = CHECK_ICON;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = COPY_ICON;
          btn.classList.remove("copied");
        }, 1500);
      } catch (e) {
        console.error("コピー失敗:", e);
      }
    });
    pre.appendChild(btn);
  });
}
