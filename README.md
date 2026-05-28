# NickForge — 遊戲 ID 生成器 / Game Nickname Generator

> ⚠️ **個人練習專案 / Personal Practice Project**
> 此為前端開發與 Cloudflare 生態系整合的練習作品。
> A practice project for learning frontend development and Cloudflare ecosystem integration.

---

依照遊戲類型、職業、風格、元素、長度等條件，產出候選遊戲暱稱，支援一鍵複製。

Generate game nicknames based on game type, role, style, elements, and length. Click to copy instantly.

---

## 功能 / Features

- 多條件篩選：遊戲類型 / 職業 / 風格 / 元素（可複選）/ 長度
- Multi-filter: Game type / Role / Style / Elements (multi-select) / Length
- Bot 防護：整合 Cloudflare Turnstile 驗證，通過後才能生成
- Bot protection: Cloudflare Turnstile verification required before generating
- Session Token：驗證過期自動重設 Turnstile
- Session Token: Auto-resets Turnstile when session expires
- 一鍵複製：點擊 ID 卡片即複製到剪貼簿
- One-click copy: Click any ID card to copy to clipboard

---

## 使用技術 / Tech Stack

| 類別 Category | 技術 Technology |
|--------------|----------------|
| 前端結構 Structure | HTML5 |
| 前端樣式 Styling | CSS3（Custom Properties、Flexbox、CSS Grid、RWD） |
| 前端邏輯 Logic | Vanilla JavaScript（Fetch API、Clipboard API、URLSearchParams） |
| Bot 防護 Bot Protection | [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) |
| 後端 API Backend | [Cloudflare Workers](https://workers.cloudflare.com/)（Serverless） |

---

## 架構概覽 / Architecture

```
Browser
 ├─ Cloudflare Turnstile 驗證 → Workers /auth → Session Token
 └─ 帶 Session Token 送篩選條件 → Workers / → ID 清單

Browser
 ├─ Turnstile verification → Workers /auth → Session Token
 └─ Send filters + Session Token → Workers / → ID list
```

---

## 本機開發 / Local Development

純靜態前端，無需 build step。/ Pure static frontend, no build step required.

```bash
# 直接開啟 index.html，或用任意 local server
# Open index.html directly, or use any local server
npx serve .
```

> 後端 API 已部署於 Cloudflare Workers。
> Backend API is deployed on Cloudflare Workers.

---

Made for Gamers 🎮 · [Buy me a coffee ☕](https://ko-fi.com/dwm331)
