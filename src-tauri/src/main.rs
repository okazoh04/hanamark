// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // WebKitGTK の DMABuf レンダラーを無効化する。
    // Wayland 環境で GPU サブプロセスが linux-dmabuf プロトコルを使う際、
    // ドライバー／コンポジターのバージョン不一致により EPROTO (71) が発生するため。
    // Markdown ビューワーとして描画品質・速度への影響は無視できる。
    #[cfg(target_os = "linux")]
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

    hanamark_lib::run();
}
