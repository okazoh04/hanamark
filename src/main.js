// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors

const THEMES = [
  "sakura", "himawari", "ajisai", "momiji", "ume",
  "tsubaki", "tanpopo", "fuji", "nadeshiko", "asagao",
];

let currentFilePath = null;

// ── 初期化 ──────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  const { invoke } = window.__TAURI__.core;

  await window.i18n.initI18n();
  initThemeSelector();
  initLangSelector();
  initDragDrop();
  await initFileWatcher();

  // 前回の状態を復元
  const config = await invoke("get_config").catch(() => ({}));
  const theme = config.last_theme || "sakura";
  await loadTheme(theme);
  if (config.last_file) {
    await loadMarkdownFile(config.last_file);
  }

  // 最近開いたファイルのメニューを初期化
  updateRecentMenu(config.recent_files || []);

  document.getElementById("btn-open").addEventListener("click", openFileDialog);
});

// ── テーマセレクター初期化 ─────────────────────────────────────────
function initThemeSelector() {
  const sel = document.getElementById("theme-select");
  THEMES.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
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

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btn-recent";
    btn.dataset.i18n = "btnRecent";
    btn.textContent = window.i18n.t("btnRecent");
    document.getElementById("toolbar").insertBefore(
      btn,
      document.getElementById("file-name")
    );
  }
  btn.style.display = "";

  if (!menu) {
    menu = document.createElement("div");
    menu.id = "recent-menu";
    document.body.appendChild(menu);
  }

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

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = btn.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;
    menu.classList.toggle("open");
  });

  document.addEventListener("click", () => menu.classList.remove("open"));
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
