#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
#
# hanamark のリリースビルドを行う。
# 生成物: src-tauri/target/release/hanamark（バイナリ）
#         src-tauri/target/release/bundle/{deb,rpm,appimage}/（パッケージ）
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if ! command -v cargo >/dev/null 2>&1; then
    echo "エラー: cargo が見つかりません。Rust をインストールしてください。" >&2
    echo "  https://www.rust-lang.org/tools/install" >&2
    exit 1
fi

if ! cargo tauri --version >/dev/null 2>&1; then
    echo "エラー: tauri-cli が見つかりません。次のコマンドでインストールしてください。" >&2
    echo "  cargo install tauri-cli" >&2
    exit 1
fi

echo "==> cargo tauri build"
BUILD_OK=1
cargo tauri build || BUILD_OK=0

BIN="src-tauri/target/release/hanamark"
BUNDLE_DIR="src-tauri/target/release/bundle"

if [ "${BUILD_OK}" -eq 0 ]; then
    if [ -x "${BIN}" ]; then
        echo
        echo "警告: バンドル処理の一部が失敗しました（AppImage は linuxdeploy 未導入の環境で失敗することがあります）。" >&2
        echo "      バイナリ自体は生成されているため続行します。" >&2
    else
        echo "エラー: ビルドに失敗しました。" >&2
        exit 1
    fi
fi

echo
echo "==> ビルド完了"
echo "  バイナリ: ${BIN}"
if [ -d "${BUNDLE_DIR}" ]; then
    find "${BUNDLE_DIR}" -maxdepth 2 -type f \( -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" \) \
        -newer "${BIN}" -print 2>/dev/null | sed 's/^/  パッケージ: /'
fi
echo
echo "インストールするには ./install.sh を実行してください。"
