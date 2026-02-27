# hanamark

> *Markdown を、花のように咲かせる。*

**hanamark** は花をモチーフにした美しい Markdown ビューワーです。
10種類の花テーマで、見出し・テーブル・コードブロックをカラフルにレンダリングします。

Tauri v2（Rust バックエンド + WebView フロントエンド）で構築されたクロスプラットフォームデスクトップアプリです。

---

## 特徴

- **10種類の花テーマ** — 桜・向日葵・紫陽花・紅葉など四季の花を配色に反映
- **多言語対応** — 日本語・英語・中国語（簡体/繁体）・韓国語・仏語・西語・独語・葡語・露語の10言語に対応。システム言語を自動検出
- **美しい見出しスタイル** — H1/H2 にグラデーション帯、H3 にテーマカラーのアンダーライン
- **リッチなテーブル** — ヘッダーグラデーション・ストライプ・ホバーハイライト・角丸シャドウ
- **シンタックスハイライト** — コードブロックを highlight.js で自動カラーリング
- **コードコピーボタン** — コードブロックにホバーするとコピーボタンが表示され、ワンクリックでクリップボードへコピー
- **CommonMark + GFM 拡張** — テーブル・タスクリスト・取り消し線・脚注に対応
- **ドラッグ＆ドロップ** — ファイルをウィンドウにドロップするだけで開く
- **ファイル監視** — エディタで保存するたびにリアルタイム自動更新
- **最近開いたファイル** — 履歴からワンクリックで再オープン
- **印刷** — A4縦固定・テーマカラー保持でそのままきれいに印刷
- **テーマのカスタマイズ** — JSON ファイルで独自テーマを作成・追加可能

---

## 組み込みテーマ

| テーマ名 | モチーフ | 配色イメージ |
|---|---|---|
| **Sakura**（桜） | 春の染井吉野 | 淡ピンク・桜白・若草グリーン |
| **Himawari**（向日葵） | 夏の向日葵畑 | ビビッドイエロー・オレンジ・サンブラウン |
| **Ajisai**（紫陽花） | 梅雨の紫陽花 | 紫・ラベンダー・青紫・ミストホワイト |
| **Momiji**（紅葉） | 秋の紅葉 | ディープレッド・バーントオレンジ・ゴールド |
| **Ume**（梅） | 早春の梅 | 臙脂・濃紅・深紫がかった白 |
| **Tsubaki**（椿） | 冬の椿 | 深紅・常緑・白 |
| **Tanpopo**（たんぽぽ） | 春の野原 | 明るい黄・新緑・爽やか |
| **Fuji**（藤） | 春の藤棚 | 柔らかな紫・薄紫・白 |
| **Nadeshiko**（撫子） | 夏撫子 | 鮮やかピンク・白・淡緑 |
| **Asagao**（朝顔） | 夏の朝顔 | 深青紫・紺碧・清々しい朝 |

---

## 動作環境

| OS | 必要なもの |
|---|---|
| **Linux** | WebKitGTK 4.1 以降 |
| **macOS** | macOS 11 以降（WebKit 内蔵） |
| **Windows** | WebView2（Windows 11 標準搭載、10 は Edge 同梱） |

### ビルドに必要なもの

- [Rust](https://www.rust-lang.org/tools/install)（1.77.2 以降）
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)（`cargo install tauri-cli`）
- プラットフォーム別の開発ツール

**Linux**

```bash
# Ubuntu / Debian
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel
```

**macOS**

```bash
xcode-select --install
```

**Windows**

Visual Studio Build Tools 2019 以降（C++ ビルドツール）をインストールしてください。

---

## ビルド・インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourname/hanamark.git
cd hanamark

# リリースビルド
cargo tauri build
```

生成物は `src-tauri/target/release/bundle/` に出力されます（Linux: AppImage/.deb、macOS: .dmg、Windows: .msi/.exe）。

---

## 開発

```bash
# 開発サーバー起動（ホットリロードあり）
cargo tauri dev

# Rust のコンパイルチェック
cd src-tauri && cargo check

# Rust のテスト
cd src-tauri && cargo test

# Lint
cd src-tauri && cargo clippy
```

フロントエンドはバンドラー不使用（Vanilla JS）。`src/` の変更は `cargo tauri dev` 起動中に自動反映されます。

---

## 使い方

1. アプリを起動する
2. ツールバーの「開く」ボタン、またはファイルをウィンドウにドラッグ＆ドロップして Markdown ファイルを開く
3. テーマセレクターでお好みのテーマを選ぶ
4. 言語セレクターで表示言語を切り替える（起動時はシステム言語を自動検出）
5. エディタで Markdown を編集・保存すると、ビューワーが自動更新される
6. コードブロックにホバーすると右上にコピーボタンが表示される
7. 「印刷」ボタンで A4 縦・テーマカラー保持のまま印刷できる

---

## カスタムテーマの作成

`src/themes/sakura.json` をコピーして独自テーマを作成できます。

```json
{
  "name": "MyTheme",
  "author": "Your Name",
  "description": "テーマの説明",
  "bg": "#ffffff",
  "text": "#333333",
  "accent": "#ff6699",
  "h1": {
    "background": "linear-gradient(135deg, #ff99bb 0%, #ffccdd 100%)",
    "color": "#cc3366",
    "border": "#ff6699"
  },
  "h2": { "background": "...", "color": "...", "underline": "..." },
  "h3": { "color": "...", "underline": "..." },
  "table": { "header": "...", "headerColor": "...", "stripe": "...", "hover": "...", "border": "..." },
  "code": { "bg": "...", "border": "...", "text": "...", "hljs": "github" },
  "quote": { "border": "...", "bg": "..." },
  "link": { "color": "...", "hover": "..." }
}
```

作成したファイルを `src/themes/<name>.json` に配置し、[main.js](src/main.js) の `THEMES` 配列と [src-tauri/src/theme.rs](src-tauri/src/theme.rs) の `list_builtin_themes()` にテーマ名を追加してください。

---

## プロジェクト構成

```
hanamark/
├── src-tauri/src/
│   ├── main.rs       エントリポイント
│   ├── lib.rs        Tauriプラグイン・コマンド登録
│   ├── commands.rs   Tauriコマンド実装
│   ├── parser.rs     pulldown-cmark で Markdown → HTML 変換
│   ├── theme.rs      テーマJSON読み込み
│   ├── config.rs     設定の保存・読み込み（前回テーマ/ファイル/履歴）
│   └── watcher.rs    ファイル監視・変更イベント発火
└── src/
    ├── index.html    UIエントリポイント
    ├── i18n.js       多言語対応モジュール（言語検出・翻訳適用）
    ├── main.js       UIロジック・イベント処理
    ├── renderer.js   テーマ適用・HTMLレンダリング・コピーボタン
    ├── styles/
    │   └── base.css  CSSカスタムプロパティ（--hm-*）ベーススタイル
    ├── themes/       組み込みテーマJSON（10種）
    └── locales/      翻訳ファイル（10言語）
```

---

## ライセンス

Copyright (C) 2026 hanamark contributors

本プロジェクトは [GNU General Public License v3.0](LICENSE) のもとで公開されています。

```
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```
