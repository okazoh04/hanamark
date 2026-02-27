// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

use pulldown_cmark::{html, Options, Parser};

/// Markdown テキストを HTML 文字列に変換する
pub fn markdown_to_html(markdown: &str) -> String {
    let mut opts = Options::empty();
    opts.insert(Options::ENABLE_TABLES);
    opts.insert(Options::ENABLE_TASKLISTS);
    opts.insert(Options::ENABLE_STRIKETHROUGH);
    opts.insert(Options::ENABLE_FOOTNOTES);

    let parser = Parser::new_ext(markdown, opts);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    html_output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_string() {
        assert_eq!(markdown_to_html(""), "");
    }

    #[test]
    fn test_heading() {
        let html = markdown_to_html("# Hello");
        assert!(html.contains("<h1>Hello</h1>"));
    }

    #[test]
    fn test_bold_and_italic() {
        let html = markdown_to_html("**bold** *italic*");
        assert!(html.contains("<strong>bold</strong>"));
        assert!(html.contains("<em>italic</em>"));
    }

    #[test]
    fn test_code_block() {
        let html = markdown_to_html("```\nlet x = 1;\n```");
        assert!(html.contains("<code>"));
    }

    #[test]
    fn test_inline_code() {
        let html = markdown_to_html("`foo`");
        assert!(html.contains("<code>foo</code>"));
    }

    // GFM 拡張: テーブル
    #[test]
    fn test_gfm_table() {
        let md = "| A | B |\n|---|---|\n| 1 | 2 |";
        let html = markdown_to_html(md);
        assert!(html.contains("<table>"));
        assert!(html.contains("<th>"));
        assert!(html.contains("<td>"));
    }

    // GFM 拡張: 打ち消し線
    #[test]
    fn test_gfm_strikethrough() {
        let html = markdown_to_html("~~strike~~");
        assert!(html.contains("<del>strike</del>"));
    }

    // GFM 拡張: タスクリスト
    #[test]
    fn test_gfm_tasklist() {
        let html = markdown_to_html("- [x] done\n- [ ] todo");
        assert!(html.contains(r#"type="checkbox""#));
    }

    // GFM 拡張: 脚注
    #[test]
    fn test_gfm_footnote() {
        let md = "text[^1]\n\n[^1]: note";
        let html = markdown_to_html(md);
        assert!(html.contains("footnote") || html.contains("fn1"));
    }
}
