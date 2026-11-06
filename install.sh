#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
#
# hanamark をインストールする。
#
# 使い方:
#   ./install.sh              ユーザーローカルにインストール（sudo不要）
#                              ~/.local/bin, ~/.local/share/applications,
#                              ~/.local/share/icons に配置
#   ./install.sh --system     .deb/.rpm パッケージをシステムにインストール（sudo）
#   ./install.sh --uninstall  ユーザーローカルインストールを削除
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

MODE="user"
if [ "${1:-}" = "--system" ]; then
    MODE="system"
elif [ "${1:-}" = "--uninstall" ]; then
    MODE="uninstall"
fi

BIN_SRC="src-tauri/target/release/hanamark"
ICON_SRC="src-tauri/icons/128x128.png"
BIN_DST="${HOME}/.local/bin/hanamark"
ICON_DST="${HOME}/.local/share/icons/hicolor/128x128/apps/hanamark.png"
DESKTOP_DST="${HOME}/.local/share/applications/hanamark.desktop"

uninstall_user() {
    echo "==> ユーザーローカルインストールを削除"
    rm -f "${BIN_DST}" "${ICON_DST}" "${DESKTOP_DST}"
    command -v update-desktop-database >/dev/null 2>&1 && \
        update-desktop-database "${HOME}/.local/share/applications" 2>/dev/null || true
    echo "削除しました。"
}

if [ "${MODE}" = "uninstall" ]; then
    uninstall_user
    exit 0
fi

if [ "${MODE}" = "system" ]; then
    DEB=$(find src-tauri/target/release/bundle/deb -maxdepth 1 -name "*.deb" 2>/dev/null | sort -V | tail -1)
    RPM=$(find src-tauri/target/release/bundle/rpm -maxdepth 1 -name "*.rpm" 2>/dev/null | sort -V | tail -1)

    if command -v dpkg >/dev/null 2>&1 && [ -n "${DEB}" ]; then
        echo "==> ${DEB} をインストール（要sudo）"
        sudo dpkg -i "${DEB}"
    elif command -v rpm >/dev/null 2>&1 && [ -n "${RPM}" ]; then
        echo "==> ${RPM} をインストール（要sudo）"
        sudo rpm -Uvh "${RPM}"
    else
        echo "エラー: インストール可能な .deb/.rpm パッケージが見つかりません。" >&2
        echo "  先に ./build.sh を実行してください。" >&2
        exit 1
    fi
    echo "システムへのインストールが完了しました。"
    exit 0
fi

# --- ユーザーローカルインストール ---
if [ ! -x "${BIN_SRC}" ]; then
    echo "==> バイナリが見つからないため build.sh を実行します"
    ./build.sh
fi

echo "==> ユーザーローカルにインストール"
mkdir -p "$(dirname "${BIN_DST}")" "$(dirname "${ICON_DST}")" "$(dirname "${DESKTOP_DST}")"

install -m 755 "${BIN_SRC}" "${BIN_DST}"
install -m 644 "${ICON_SRC}" "${ICON_DST}"

cat > "${DESKTOP_DST}" <<EOF
[Desktop Entry]
Type=Application
Name=hanamark
Comment=A beautiful, colorful Markdown viewer
Exec=${BIN_DST} %f
Icon=hanamark
Terminal=false
Categories=Utility;TextEditor;
MimeType=text/markdown;text/x-markdown;
StartupWMClass=hanamark
EOF
chmod 644 "${DESKTOP_DST}"

command -v update-desktop-database >/dev/null 2>&1 && \
    update-desktop-database "${HOME}/.local/share/applications" 2>/dev/null || true
command -v gtk-update-icon-cache >/dev/null 2>&1 && \
    gtk-update-icon-cache -f "${HOME}/.local/share/icons/hicolor" 2>/dev/null || true

echo
echo "インストール完了: ${BIN_DST}"
if [[ ":${PATH}:" != *":${HOME}/.local/bin:"* ]]; then
    echo "注意: ${HOME}/.local/bin が PATH に含まれていません。シェルの設定ファイルに追加してください。"
fi
echo "削除するには: ./install.sh --uninstall"
