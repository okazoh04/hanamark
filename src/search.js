/*
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (c) 2026 okazoh04
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3.
 * See the LICENSE file for details.
 */

const Search = (() => {
  let matches = [];
  let currentIndex = -1;
  let isOpen = false;

  function open() {
    isOpen = true;
    document.getElementById("search-bar").style.display = "flex";
    const input = document.getElementById("search-input");
    input.focus();
    input.select();
  }

  function close() {
    isOpen = false;
    document.getElementById("search-bar").style.display = "none";
    clearHighlights();
    matches = [];
    currentIndex = -1;
    updateCount();
  }

  function clearHighlights() {
    document.getElementById("content").querySelectorAll("mark.search-hl").forEach((mark) => {
      mark.parentNode.replaceChild(document.createTextNode(mark.textContent), mark);
      mark.parentNode.normalize();
    });
  }

  function search(query) {
    clearHighlights();
    matches = [];
    currentIndex = -1;

    if (!query) {
      updateCount();
      return;
    }

    const content = document.getElementById("content");
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      if (!regex.test(text)) return;
      regex.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let m;
      while ((m = regex.exec(text)) !== null) {
        if (m.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
        }
        const mark = document.createElement("mark");
        mark.className = "search-hl";
        mark.textContent = m[0];
        frag.appendChild(mark);
        matches.push(mark);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      textNode.parentNode.replaceChild(frag, textNode);
    });

    if (matches.length > 0) {
      currentIndex = 0;
      scrollToMatch(0);
    }
    updateCount();
  }

  function scrollToMatch(idx) {
    matches.forEach((m, i) => m.classList.toggle("current", i === idx));
    if (matches[idx]) {
      matches[idx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function next() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex + 1) % matches.length;
    scrollToMatch(currentIndex);
    updateCount();
  }

  function prev() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    scrollToMatch(currentIndex);
    updateCount();
  }

  function updateCount() {
    const el = document.getElementById("search-count");
    if (!el) return;
    const query = document.getElementById("search-input").value;
    if (!query) {
      el.textContent = "";
      el.classList.remove("no-match");
    } else if (matches.length === 0) {
      el.textContent = "見つかりません";
      el.classList.add("no-match");
    } else {
      el.textContent = `${currentIndex + 1} / ${matches.length}`;
      el.classList.remove("no-match");
    }
  }

  // コンテンツが置き換えられたとき（renderContent 後）に呼ぶ
  function onContentChange() {
    matches = [];
    currentIndex = -1;
    if (isOpen) {
      const query = document.getElementById("search-input").value;
      if (query) search(query);
      else updateCount();
    }
  }

  function init() {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        open();
      } else if (e.key === "Escape" && isOpen) {
        close();
      }
    });

    const input = document.getElementById("search-input");
    input.addEventListener("input", () => search(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.shiftKey ? prev() : next();
      }
    });

    document.getElementById("search-prev").addEventListener("click", prev);
    document.getElementById("search-next").addEventListener("click", next);
    document.getElementById("search-close").addEventListener("click", close);
  }

  return { init, open, close, onContentChange };
})();
