// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

use notify::event::ModifyKind;
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::Manager;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

pub struct WatcherState(pub Mutex<Option<RecommendedWatcher>>);

/// ファイル監視を開始する。
/// Vim のアトミック書き込み（テンプファイル→rename）にも対応するため
/// 親ディレクトリを監視し、対象ファイルに関係するイベントのみを通知する。
pub fn start_watching(app: AppHandle, path: String) -> Result<(), String> {
    let target: PathBuf = PathBuf::from(&path);
    let path_for_emit = path.clone();
    let app_for_emit = app.clone();

    // 100ms のデバウンス（Vim は複数イベントを連続して発火させるため）
    let last_emit: Arc<Mutex<Option<Instant>>> = Arc::new(Mutex::new(None));

    let mut watcher = RecommendedWatcher::new(
        move |res: Result<Event, notify::Error>| {
            let Ok(event) = res else { return };

            let relevant = match event.kind {
                // 直接書き込み
                EventKind::Modify(ModifyKind::Data(_)) => {
                    event.paths.iter().any(|p| p == &target)
                }
                // Vim の rename-to（アトミック書き込み）
                EventKind::Modify(ModifyKind::Name(_)) => {
                    event.paths.iter().any(|p| p == &target)
                }
                // その他の作成イベント
                EventKind::Create(_) => event.paths.iter().any(|p| p == &target),
                _ => false,
            };

            if !relevant {
                return;
            }

            // デバウンス: 前回の通知から 100ms 経過していなければスキップ
            let mut last = last_emit.lock().unwrap();
            if let Some(t) = *last {
                if t.elapsed() < Duration::from_millis(100) {
                    return;
                }
            }
            *last = Some(Instant::now());
            drop(last);

            let _ = app_for_emit.emit("file_changed", &path_for_emit);
        },
        Config::default(),
    )
    .map_err(|e| e.to_string())?;

    // 親ディレクトリを監視（Vim rename はファイル単体では検知できない）
    let watch_dir = PathBuf::from(&path)
        .parent()
        .ok_or("パスから親ディレクトリを取得できません")?
        .to_path_buf();

    watcher
        .watch(&watch_dir, RecursiveMode::NonRecursive)
        .map_err(|e| e.to_string())?;

    let state = app.state::<WatcherState>();
    *state.0.lock().unwrap() = Some(watcher);
    Ok(())
}

/// ファイル監視を停止する。
pub fn stop_watching(app: &AppHandle) {
    let state = app.state::<WatcherState>();
    *state.0.lock().unwrap() = None;
}
