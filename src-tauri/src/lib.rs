// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 hanamark contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

mod commands;
mod config;
mod parser;
mod theme;
mod watcher;

use watcher::WatcherState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(WatcherState(std::sync::Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            commands::load_file,
            commands::list_themes,
            commands::load_theme,
            commands::start_watch,
            commands::stop_watch,
            commands::get_config,
            commands::save_app_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running hanamark");
}
