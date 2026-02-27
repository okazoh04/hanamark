// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

use std::fs;
use tauri::AppHandle;

use crate::config::{load_config, push_recent_file, save_config, AppConfig};
use crate::parser::markdown_to_html;
use crate::theme::{list_builtin_themes, load_theme_json};
use crate::watcher::{start_watching, stop_watching};

/// 指定パスの Markdown ファイルを読み込み HTML に変換して返す
#[tauri::command]
pub fn load_file(path: String) -> Result<String, String> {
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(markdown_to_html(&content))
}

/// 利用可能なテーマ名一覧を返す
#[tauri::command]
pub fn list_themes(app: AppHandle) -> Vec<String> {
    list_builtin_themes(&app)
}

/// 指定テーマの JSON 文字列を返す
#[tauri::command]
pub fn load_theme(app: AppHandle, name: String) -> Result<String, String> {
    load_theme_json(&app, &name)
}

/// 指定パスのファイル監視を開始する
#[tauri::command]
pub fn start_watch(app: AppHandle, path: String) -> Result<(), String> {
    start_watching(app, path)
}

/// ファイル監視を停止する
#[tauri::command]
pub fn stop_watch(app: AppHandle) {
    stop_watching(&app);
}

/// 設定を読み込む（起動時に呼ぶ）
#[tauri::command]
pub fn get_config(app: AppHandle) -> AppConfig {
    load_config(&app)
}

/// 起動時のコマンドライン引数からファイルパスを取得する
#[tauri::command]
pub fn get_startup_file() -> Option<String> {
    std::env::args()
        .skip(1)
        .find(|a| !a.starts_with('-') && std::path::Path::new(a).exists())
}

/// 設定を保存する（ファイルを開いたとき・テーマ変更時に呼ぶ）
#[tauri::command]
pub fn save_app_config(
    app: AppHandle,
    last_theme: Option<String>,
    last_file: Option<String>,
) -> Result<(), String> {
    let mut config = load_config(&app);
    if let Some(theme) = last_theme {
        config.last_theme = Some(theme);
    }
    if let Some(ref file) = last_file {
        push_recent_file(&mut config.recent_files, file);
        config.last_file = Some(file.clone());
    }
    save_config(&app, &config)
}
