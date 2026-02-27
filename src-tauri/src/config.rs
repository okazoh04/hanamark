// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const MAX_RECENT_FILES: usize = 20;

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct AppConfig {
    pub last_theme: Option<String>,
    pub last_file: Option<String>,
    pub recent_files: Vec<String>,
}

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("config.json"))
}

pub fn load_config(app: &AppHandle) -> AppConfig {
    let Ok(path) = config_path(app) else {
        return AppConfig::default();
    };
    let Ok(text) = std::fs::read_to_string(&path) else {
        return AppConfig::default();
    };
    serde_json::from_str(&text).unwrap_or_default()
}

pub fn save_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = config_path(app)?;
    let text = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    std::fs::write(&path, text).map_err(|e| e.to_string())
}

/// 最近開いたファイルリストに追加（重複排除・最大20件）
pub fn push_recent_file(recent: &mut Vec<String>, path: &str) {
    recent.retain(|p| p != path);
    recent.insert(0, path.to_string());
    recent.truncate(MAX_RECENT_FILES);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_push_first_entry() {
        let mut recent = vec![];
        push_recent_file(&mut recent, "/a.md");
        assert_eq!(recent, vec!["/a.md"]);
    }

    #[test]
    fn test_push_inserts_at_front() {
        let mut recent = vec!["/a.md".to_string()];
        push_recent_file(&mut recent, "/b.md");
        assert_eq!(recent[0], "/b.md");
        assert_eq!(recent[1], "/a.md");
    }

    #[test]
    fn test_push_deduplicates() {
        let mut recent = vec!["/a.md".to_string(), "/b.md".to_string()];
        push_recent_file(&mut recent, "/b.md");
        assert_eq!(recent, vec!["/b.md", "/a.md"]);
    }

    #[test]
    fn test_push_duplicate_already_at_front() {
        let mut recent = vec!["/a.md".to_string(), "/b.md".to_string()];
        push_recent_file(&mut recent, "/a.md");
        assert_eq!(recent, vec!["/a.md", "/b.md"]);
    }

    #[test]
    fn test_push_enforces_max_limit() {
        let mut recent: Vec<String> = (0..MAX_RECENT_FILES).map(|i| format!("/{i}.md")).collect();
        push_recent_file(&mut recent, "/new.md");
        assert_eq!(recent.len(), MAX_RECENT_FILES);
        assert_eq!(recent[0], "/new.md");
        assert!(!recent.contains(&format!("/{}.md", MAX_RECENT_FILES - 1)));
    }
}
