// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors

(function () {
  const SUPPORTED = ["ja", "en", "zh-CN", "zh-TW", "ko", "fr", "es", "de", "pt", "ru"];

  const LANG_NAMES = {
    ja: "日本語",
    en: "English",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    ko: "한국어",
    fr: "Français",
    es: "Español",
    de: "Deutsch",
    pt: "Português",
    ru: "Русский",
  };

  let _lang = "ja";
  let _msgs = {};

  function detectLang() {
    const saved = localStorage.getItem("hm-lang");
    if (saved && SUPPORTED.includes(saved)) return saved;

    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("zh")) {
      if (nav.includes("tw") || nav.includes("hk") || nav.includes("hant")) return "zh-TW";
      return "zh-CN";
    }
    const base = nav.split("-")[0];
    if (SUPPORTED.includes(base)) return base;
    if (SUPPORTED.includes(nav)) return nav;
    return "ja";
  }

  async function loadLocale(lang) {
    const res = await fetch(`locales/${lang}.json`);
    if (!res.ok) throw new Error(`locale not found: ${lang}`);
    return res.json();
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.documentElement.lang = _lang;
    // CSS content プロパティ用（クォートを含む値をセット）
    document.documentElement.style.setProperty(
      "--hm-drop-text",
      `"${t("dropFile").replace(/"/g, '\\"')}"`,
    );
    // 言語セレクターを同期
    const sel = document.getElementById("lang-select");
    if (sel) sel.value = _lang;
  }

  function t(key) {
    return _msgs[key] ?? key;
  }

  async function initI18n() {
    _lang = detectLang();
    _msgs = await loadLocale(_lang);
    applyTranslations();
  }

  async function setLanguage(lang) {
    _msgs = await loadLocale(lang);
    _lang = lang;
    localStorage.setItem("hm-lang", lang);
    applyTranslations();
  }

  function getCurrentLang() {
    return _lang;
  }

  window.i18n = { t, initI18n, setLanguage, getCurrentLang, SUPPORTED, LANG_NAMES };
})();
