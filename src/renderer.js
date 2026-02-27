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

  window.scrollTo(0, scrollTop);
}
