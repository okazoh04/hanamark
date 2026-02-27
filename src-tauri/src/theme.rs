// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

use tauri::{AppHandle, Manager};

fn builtin_theme_names() -> Vec<String> {
    vec![
        "sakura".to_string(),
        "himawari".to_string(),
        "ajisai".to_string(),
        "momiji".to_string(),
        "ume".to_string(),
        "tsubaki".to_string(),
        "tanpopo".to_string(),
        "fuji".to_string(),
        "nadeshiko".to_string(),
        "asagao".to_string(),
    ]
}

/// 組み込みテーマのファイル名一覧（拡張子なし）
pub fn list_builtin_themes(_app: &AppHandle) -> Vec<String> {
    builtin_theme_names()
}

/// 指定テーマの JSON 文字列を返す
/// テーマファイルは `src/themes/<name>.json` に配置されている
pub fn load_theme_json(app: &AppHandle, name: &str) -> Result<String, String> {
    // 開発時はリソースディレクトリから、リリース時はバンドルリソースから取得
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?
        .join("themes")
        .join(format!("{}.json", name));

    std::fs::read_to_string(&resource_path)
        .map_err(|e| format!("テーマ '{}' の読み込みに失敗: {}", name, e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_builtin_theme_count() {
        assert_eq!(builtin_theme_names().len(), 10);
    }

    #[test]
    fn test_builtin_theme_names_contains_all() {
        let themes = builtin_theme_names();
        let expected = [
            "sakura", "himawari", "ajisai", "momiji", "ume",
            "tsubaki", "tanpopo", "fuji", "nadeshiko", "asagao",
        ];
        for name in &expected {
            assert!(themes.contains(&name.to_string()), "テーマ '{name}' が見つからない");
        }
    }

    #[test]
    fn test_builtin_theme_names_no_duplicates() {
        let themes = builtin_theme_names();
        let mut deduped = themes.clone();
        deduped.dedup();
        assert_eq!(themes.len(), deduped.len());
    }
}
