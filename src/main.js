/*
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (c) 2026 okazoh04
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3.
 * See the LICENSE file for details.
 */

let currentFilePath = null;

// ── 初期化 ──────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  const { invoke } = window.__TAURI__.core;

  await window.i18n.initI18n();
  await initThemeSelector();
  initLangSelector();
  initDragDrop();
  Search.init();
  await initFileWatcher();

  // 前回の状態を復元
  const config = await invoke("get_config").catch(() => ({}));
  const theme = config.last_theme || "sakura";
  await loadTheme(theme);

  // コマンドライン引数で指定されたファイルを優先して開く
  const startupFile = await invoke("get_startup_file").catch(() => null);
  if (startupFile) {
    await loadMarkdownFile(startupFile);
  } else if (config.last_file) {
    await loadMarkdownFile(config.last_file);
  }

  // 最近開いたファイルのメニューを初期化
  updateRecentMenu(config.recent_files || []);

  document.getElementById("btn-open").addEventListener("click", openFileDialog);
  document.getElementById("btn-print").addEventListener("click", openPrintPreview);
  document.getElementById("print-go").addEventListener("click", () => window.print());
  document.getElementById("print-close").addEventListener("click", closePrintPreview);
  window.addEventListener("afterprint", closePrintPreview);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("print-root").style.display === "flex") {
      closePrintPreview();
    }
  });

  const version = await invoke("plugin:app|version").catch(() => null);
  if (version) document.getElementById("footer-version").textContent = `v${version}`;
});

// ── テーマセレクター初期化 ─────────────────────────────────────────
const THEME_FLOWERS = {
  sakura:    "🌸",
  ume:       "🌸",
  tsubaki:   "🌺",
  ajisai:    "💐",
  asagao:    "🌺",
  fuji:      "🪻",
  himawari:  "🌻",
  tanpopo:   "🌼",
  nadeshiko: "💮",
  momiji:    "🍁",
};

async function initThemeSelector() {
  const { invoke } = window.__TAURI__.core;
  const themes = await invoke("list_themes");
  const sel = document.getElementById("theme-select");
  themes.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    const flower = THEME_FLOWERS[name] || "🌸";
    opt.textContent = flower + " " + name.charAt(0).toUpperCase() + name.slice(1);
    sel.appendChild(opt);
  });
  sel.addEventListener("change", async () => {
    await loadTheme(sel.value);
    await saveState({ last_theme: sel.value });
  });
}

// ── 言語セレクター初期化 ───────────────────────────────────────────
function initLangSelector() {
  const sel = document.getElementById("lang-select");
  const { SUPPORTED, LANG_NAMES, getCurrentLang } = window.i18n;
  SUPPORTED.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = LANG_NAMES[lang];
    sel.appendChild(opt);
  });
  sel.value = getCurrentLang();
  sel.addEventListener("change", async () => {
    await window.i18n.setLanguage(sel.value);
  });
}

// ── テーマ読み込み・適用 ────────────────────────────────────────────
async function loadTheme(name) {
  try {
    const res = await fetch(`themes/${name}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const theme = await res.json();
    applyTheme(theme);
    document.getElementById("theme-select").value = name;
  } catch (e) {
    console.error("テーマ読み込み失敗:", e);
  }
}

// ── ファイルを開く ──────────────────────────────────────────────────
async function openFileDialog() {
  const { open } = window.__TAURI__.dialog;
  const selected = await open({
    filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
    multiple: false,
  });
  if (!selected) return;
  await loadMarkdownFile(selected);
}

async function loadMarkdownFile(path) {
  const { invoke } = window.__TAURI__.core;
  try {
    const html = await invoke("load_file", { path });
    renderContent(html);

    await invoke("start_watch", { path });

    currentFilePath = path;
    document.getElementById("file-name").textContent = path.split("/").pop();

    // 設定を保存し最近のファイルメニューを更新
    const config = await saveState({ last_file: path });
    if (config?.recent_files) {
      updateRecentMenu(config.recent_files);
    }
  } catch (e) {
    console.error("ファイル読み込み失敗:", e);
    document.getElementById("content").innerHTML =
      `<p style="color:red">${window.i18n.t("errorOpen")}: ${e}</p>`;
  }
}

// ── 設定保存 ────────────────────────────────────────────────────────
async function saveState({ last_theme = null, last_file = null } = {}) {
  const { invoke } = window.__TAURI__.core;
  try {
    await invoke("save_app_config", { lastTheme: last_theme, lastFile: last_file });
    return await invoke("get_config");
  } catch (e) {
    console.error("設定保存失敗:", e);
    return null;
  }
}

// ── 最近開いたファイルメニュー ──────────────────────────────────────
function updateRecentMenu(recentFiles) {
  let menu = document.getElementById("recent-menu");
  let btn = document.getElementById("btn-recent");

  if (!recentFiles || recentFiles.length === 0) {
    if (btn) btn.style.display = "none";
    return;
  }

  // ボタンとメニューは初回のみ作成し、イベントリスナーも初回のみ登録する
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btn-recent";
    btn.dataset.i18n = "btnRecent";
    btn.textContent = window.i18n.t("btnRecent");
    document.getElementById("toolbar").insertBefore(
      btn,
      document.getElementById("file-name")
    );

    menu = document.createElement("div");
    menu.id = "recent-menu";
    document.body.appendChild(menu);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = btn.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.left = `${rect.left}px`;
      menu.classList.toggle("open");
    });

    document.addEventListener("click", () => menu.classList.remove("open"));
  }

  btn.style.display = "";

  menu.innerHTML = recentFiles
    .map(
      (p) =>
        `<div class="recent-item" title="${p}">${p.split("/").pop()}</div>`
    )
    .join("");

  menu.querySelectorAll(".recent-item").forEach((el, i) => {
    el.addEventListener("click", async () => {
      menu.classList.remove("open");
      await loadMarkdownFile(recentFiles[i]);
    });
  });
}

// ── ファイル監視（Rust→フロントへの file_changed イベント受信）──────
async function initFileWatcher() {
  const { listen } = window.__TAURI__.event;
  await listen("file_changed", async (event) => {
    const path = event.payload;
    if (!path || path !== currentFilePath) return;
    await reloadCurrentFile();
  });
}

async function reloadCurrentFile() {
  if (!currentFilePath) return;
  const { invoke } = window.__TAURI__.core;
  try {
    const html = await invoke("load_file", { path: currentFilePath });
    renderContent(html);
  } catch (e) {
    console.error("リロード失敗:", e);
  }
}

// ── 印刷プレビュー（Paged.js でページ分割・ページ番号を付与） ────────
async function openPrintPreview() {
  const content = document.getElementById("content");
  const printRoot = document.getElementById("print-root");
  const printPages = document.getElementById("print-pages");
  if (!content || !printRoot || !printPages) return;

  if (typeof Paged === "undefined") {
    console.error("Paged.js の読み込みに失敗したため通常印刷を行います");
    window.print();
    return;
  }

  const contentHTML = content.outerHTML;

  printPages.innerHTML = "";
  printRoot.style.display = "flex";
  document.body.classList.add("print-preview-active");
  // Paged.js は渡したスタイルシート中の #content 指定を [data-id="content"] に
  // 書き換えて複製ページにも適用するため、CSS側で元の #content を隠すと複製側も
  // 巻き添えで非表示になる。JS側で元要素だけを直接隠す。
  content.style.display = "none";

  try {
    const previewer = new Paged.Previewer();
    await previewer.preview(
      contentHTML,
      ["styles/base.css", "styles/print.css"],
      printPages
    );
  } catch (e) {
    console.error("印刷プレビュー生成失敗:", e);
    closePrintPreview();
    window.print();
  }
}

function closePrintPreview() {
  const content = document.getElementById("content");
  const printRoot = document.getElementById("print-root");
  const printPages = document.getElementById("print-pages");
  if (content) content.style.display = "";
  if (printRoot) printRoot.style.display = "none";
  if (printPages) printPages.innerHTML = "";
  document.body.classList.remove("print-preview-active");
}

// ── ドラッグ＆ドロップ ──────────────────────────────────────────────
function initDragDrop() {
  const { listen } = window.__TAURI__.event;
  const mdExtensions = ["md", "markdown", "txt"];

  listen("tauri://drag-drop", async (event) => {
    document.body.classList.remove("drag-over");
    const paths = event.payload?.paths;
    if (!paths || paths.length === 0) return;
    const mdFile = paths.find((p) =>
      mdExtensions.includes(p.split(".").pop().toLowerCase())
    );
    if (mdFile) await loadMarkdownFile(mdFile);
  });

  listen("tauri://drag-enter", () => {
    document.body.classList.add("drag-over");
  });
  listen("tauri://drag-leave", () => {
    document.body.classList.remove("drag-over");
  });
}
