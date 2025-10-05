# 🌟 Awesome MorphixAI Apps

> 厳選された MorphixAI アプリケーションコレクション - 高速開発、統合管理

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-MorphixAI-blue?logo=github)](https://github.com/Morphicai/awesome-morphix-apps)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[![Twitter](https://img.shields.io/badge/Twitter-MorphixAI-1DA1F2?logo=twitter&logoColor=white)](https://x.com/MorphixAI)
[![Discord](https://img.shields.io/badge/Discord-Community-7289DA?logo=discord&logoColor=white)](https://discord.gg/HTknmpUM)
[![Reddit](https://img.shields.io/badge/Reddit-r/MorphixAI-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/r/MorphixAI/)

[English](README.md) | [中文](README_CN.md) | [한국어](README_KR.md)

</div>

## 📖 プロジェクト概要

これは複数の高品質な MorphixAI アプリケーションの統合管理のための **MorphixAI アプリケーションコレクション管理プロジェクト**です。

### ✨ コア機能

- 🚀 **高速作成** - ワンクリックで新しいアプリケーションプロジェクトを作成
- 🎯 **統合管理** - すべてのアプリケーションと依存関係の一元管理
- 🛠️ **開発ツール** - 完全な CLI ツールチェーンサポート

### 🔗 @morphixai/code との関係

このプロジェクトは、MorphixAI アプリケーション作成のための基盤フレームワークとして [@morphixai/code](https://github.com/Morphicai/morphixai-code) を使用しています。`@morphixai/code` パッケージは以下を提供します：

- アプリケーションテンプレートとスキャフォールディング
- 開発環境セットアップ
- ビルドとデプロイツール
- MorphixAI プラットフォーム統合

フレームワークの詳細なドキュメントについては、[公式 @morphixai/code リポジトリ](https://github.com/Morphicai/morphixai-code)をご覧ください。

## 📚 利用可能なアプリケーション

| 名前 | 説明 | 作成者 | 機能 | スクリーンショット | デモ | 詳細 |
|------|------|--------|------|-------------------|------|------|
| ⏰ **timer** | ポモドーロタイマーアプリケーション - タスク管理 + ポモドーロテクニック | MorphixAI Team | • タスク管理システム<br>• ポモドーロタイマー<br>• データ統計<br>• 多言語サポート (EN/CN) | ![timer](./apps/timer/screenshot/1.jpg) | [ライブデモ →](https://app-shell.focusbe.com/app/1219e970-e531-4157-bce9-e8f4dcaaf6a6#/) | [詳細を見る →](./apps/timer/README.md) |
| 📊 **mermaid** | Mermaid ダイアグラムエディター - 様々なダイアグラムの作成と編集 | MorphixAI Team | • 複数のダイアグラムタイプ<br>• バージョン管理<br>• リアルタイムプレビュー<br>• エクスポート機能 | ![mermaid](./apps/mamerid/screenshot/1.jpg) | [ライブデモ →](https://app-shell.focusbe.com/app/244975ac-609a-4a12-a02f-88d1512e9b60) | [詳細を見る →](./apps/mamerid/README.md) |
| 🤔 **Million Questions AI** | AI搭載ビジネスアイデア分析および意思決定支援ツール | MorphixAI Team | • ゴールデン質問リスト生成<br>• AIメンター推薦<br>• アクションブループリント<br>• バーチャル取締役会<br>• ソーシャルメディア共有 | ![million-questions-ai](./apps/million-questions-ai/screenshot/1.png) | [ライブデモ →](https://app-shell.focusbe.com/app/百万问ai-287d31ea-74d9-4cb4-9c48-37857d099358#/) | [詳細を見る →](./apps/million-questions-ai/README.md) |

> 📝 **注意**: デモリンクは `https://app-shell.focusbe.com/app/{remoteId}` の形式を使用します

## 📁 プロジェクト構造

> 🎯 すべてのアプリケーションとツールの統合管理のための pnpm monorepo アーキテクチャベース

```
awesome-morphix-apps/
├── apps/                  # 📱 すべてのアプリケーション
│   └── timer/             # ⏰ ポモドーロタイマーアプリケーション
│       ├── src/app/       # タスク管理 + ポモドーロ機能
│       ├── src/_dev/      # 開発環境シェル
│       └── docs/          # プロジェクトドキュメント
│
├── tools/                 # 🛠️ 開発ツール
│   └── cli/               # CLI ツールキット
│       ├── bin/
│       │   └── morphix.js # 統合 CLI エントリーポイント
│       ├── create-app.js  # 新しいアプリケーションの作成
│       ├── sync-docs.js   # ドキュメント同期
│       └── dev.js         # 開発サーバー
│
├── docs/                  # 📚 共有ドキュメント
│   ├── CONTRIBUTING.md    # 貢献ガイド
│   └── QUICK_START.md     # クイックスタートガイド
│
├── pnpm-workspace.yaml    # pnpm workspace 設定
├── package.json           # ルートプロジェクト設定
└── README.md              # このファイル
```

## 🚀 クイックスタート

### 要件

- **Node.js** 18+ (LTS バージョン推奨)
- **Git**
- サポート OS: macOS, Windows, Linux

> 💡 **pnpm をグローバルにインストールする必要はありません**  
> プロジェクトに pnpm が含まれているため、`pnpm` コマンドを直接使用してください

### インストール

```bash
# リポジトリをクローン
git clone git@github.com:Morphicai/awesome-morphix-apps.git
cd awesome-morphix-apps

# すべての依存関係をインストール（すべてのアプリケーションと pnpm を含む）
pnpm install
```

## 🛠️ プロジェクト管理

### 新しいアプリケーションの作成

CLI ツールを使用して新しい MorphixAI アプリケーションを素早く作成：

```bash
# インタラクティブ作成
npm run create

# またはアプリケーション名を直接指定
npm run create my-awesome-app
```

作成プロセス：
1. ✅ `npx @morphixai/code create` を使用してアプリケーションを作成
2. ✅ アプリケーションが `apps/` ディレクトリに作成されることを保証
3. ✅ プロジェクト構造と設定を自動生成
4. ✅ 依存関係を自動インストール
5. ✅ 開発環境を初期化

### アプリケーション開発

**方法1: インタラクティブ開発（推奨）**

ルートディレクトリで実行すると、選択メニューが表示されます：

```bash
npm run dev
```

インタラクティブメニューサポート：
- 📱 ↑↓ 矢印キーでアプリケーションを選択
- ➕ 新しいアプリケーションを作成
- ❌ 終了

**方法2: 直接プロジェクトエントリ**

```bash
cd apps/timer
pnpm install
npm run dev
```

ブラウザが自動的に `http://localhost:8812` を開きます

## 🎯 開発ガイドライン

すべてのアプリケーションは統一された開発標準に従う必要があります：

### コア制約

- ✅ **開発エリア**: `src/app/` ディレクトリ内でのみ開発
- ❌ **変更禁止**: `src/_dev/`、設定ファイル、ビルドスクリプトの変更不可
- 📦 **技術スタック**: React 19 + Ionic React 8.6.2
- 🎨 **スタイリング**: CSS Modules の使用必須
- 🔒 **エントリーポイント**: `src/app/app.jsx`

### 推奨ツール

- **Cursor AI** - 完全な開発標準を内蔵
- **Claude Code** - 自然言語プログラミングサポート
- **VS Code** - Vite プラグインと併用

## 📦 公開プロセス

### 開発環境テスト

```bash
cd your-app
npm run dev
```

### MorphixAI プラットフォームへの公開

1. **方法1: 手動公開**
   - 開発環境のコントロールパネルで「アプリケーションをアップロード」をクリック
   - アプリケーション情報を入力してレビューのために提出

2. **方法2: 公式マーケットプレイス**
   - `contact@baibian.app` にメールを送信
   - アプリケーション情報と使用説明書を提供

## 🔧 CLI コマンド

### Monorepo コマンド

> 💡 スクリプトには `npm`、インストールには `pnpm` を使用

```bash
# 🎯 インタラクティブ開発（推奨）
npm run dev              # プロジェクト選択メニューを表示

# 新しいアプリケーションを作成
npm run create [name]

# ドキュメントを同期
npm run sync-docs [app]

# すべての依存関係をインストール
pnpm install

# すべての node_modules をクリーン
npm run clean
```

### サブプロジェクトコマンド

```bash
# 🎯 推奨: インタラクティブコマンドを使用
npm run dev                        # 開発するプロジェクトを選択

# ルートディレクトリで pnpm フィルターを使用
pnpm --filter timer dev            # 特定のアプリケーションを開発

# またはサブプロジェクトに入る
cd apps/timer
pnpm install                       # 依存関係をインストール
npm run dev                        # 開発サーバーを開始
npm run generate-id                # プロジェクト ID を生成
```

## 🤝 貢献ガイド

新しいアプリケーションの貢献や既存アプリケーションの改善を歓迎します！

### 貢献プロセス

1. このリポジトリをフォーク
2. 機能用の新しいブランチを作成
   ```bash
   git checkout -b feature/my-new-app
   ```
3. 新しいアプリケーションを作成または既存のアプリケーションを改善
   ```bash
   npm run create my-app
   cd apps/my-app
   # 開発開始...
   ```
4. 変更をコミット
   ```bash
   git add .
   git commit -m "feat(my-app): 新しいアプリケーションを追加"
   ```
5. ブランチにプッシュ
   ```bash
   git push origin feature/my-new-app
   ```
6. ブランチからメインブランチへプルリクエストを作成

### アプリケーション品質要件

- ✅ コードが開発標準に従っている
- ✅ 完全なドキュメントを提供
- ✅ 開発環境でテストに合格
- ✅ MorphixAI プラットフォーム制約に従っている
- ✅ 実用的価値を持っている

## 📖 関連リソース

### 公式ドキュメント
- [MorphixAI 公式ウェブサイト](https://baibian.app/)
- [@morphixai/code フレームワーク](https://github.com/Morphicai/morphixai-code)
- [アプリケーションマーケットプレイス](https://app-shell.focusbe.com/app-market)

### 技術ドキュメント
- [React 公式ドキュメント](https://react.dev/)
- [Ionic React](https://ionicframework.com/docs/react)
- [Vite ドキュメント](https://vitejs.dev/)

### コミュニティ
- GitHub Issues - バグレポートとフィードバック
- GitHub Discussions - 技術討論
- Email: contact@baibian.app

### ソーシャルメディア
- [Twitter/X](https://x.com/MorphixAI) - 最新アップデートとお知らせ
- [Discord](https://discord.gg/HTknmpUM) - コミュニティチャットとサポート
- [Reddit](https://www.reddit.com/r/MorphixAI/) - コミュニティディスカッション
- [小红书 (Xiaohongshu)](https://www.xiaohongshu.com/user/profile/585f9bb150c4b429edd4224e) - 中国コミュニティ
- [抖音 (Douyin)](https://v.douyin.com/qr4TImD9qZ0/) - ビデオコンテンツとチュートリアル

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。

---

<div align="center">

**Made with ❤️ by MorphixAI Community**

[⬆ トップに戻る](#-awesome-morphixai-apps)

</div>
