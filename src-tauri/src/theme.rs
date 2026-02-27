// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

use tauri::{AppHandle, Manager};

/// 組み込みテーマのファイル名一覧（拡張子なし）
pub fn list_builtin_themes(_app: &AppHandle) -> Vec<String> {
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
