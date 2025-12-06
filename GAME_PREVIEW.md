# 🕯️ Project: CANDLE WICK (Telegram Mini App Game)

## 1. Game Concept & Core Mechanics
**Genre:** Infinite Runner / Arcade (Flappy Bird style with a Crypto/Trading twist).
**Goal:** Survive as long as possible, avoiding "Liquidation Lines" (obstacles), and collecting AZC tokens.

### 🕹️ Gameplay Physics (The "Wick" Mechanic)
- **Movement:**
  - **Touch/Hold:** The character (Candle Body) moves **UP**. Color changes to **GREEN** (Bullish).
  - **Release:** The character moves **DOWN**. Color changes to **RED** (Bearish).
- **Visual Trail:** The candle leaves a wick trail behind it.
- **Obstacles (Liquidation Lines):** 
  - Dual obstacles (Top & Bottom gates).
  - **Difficulty Scaling:** Speed increases and gaps decrease every 100 points (Levels 1-10).
  - Touching them triggers "Game Over" (Liquidation).

### 🏆 Scoring System
- **Base Score:** +10 Points for every obstacle passed.
- **Bonuses:** 
  - Every 100 points: **+20 Extra Score**.
  - Every 100 points: A **Coin** spawns (+10 AZC).
- **High Score:** Persists in Firebase and shows on the UI.

---

## 2. Game Economy & Monetization
### 💰 Currency: AZC (AzCash)
- Earned by collecting coins every 10 obstacles.
- Earned by completing tasks (future update).
- **Storage:** Saved securely in Firebase Firestore (`users` collection).

### 📺 Revive System (Game Over Modal)
When the user crashes, a modal appears with 3 options:
1.  **Pay to Continue:** Uses Telegram Stars (Premium option).
2.  **Watch Ad to Continue:** Uses Adsgram/GramAds. (Limit: Max 3 times per session).
3.  **Restart:** A prominent button at the bottom to start over (Score resets).

### 🤝 Referral & Tasks (Home Screen)
- **"Earn Money Systems" Button:** (Currently Disabled/Grayed out).
  - Logic: Will list external mini-apps.
  - Reward: +20 AZC for opening a partner app (one-time per app).

---

## 3. UI/UX Structure (Mobile First)

**Font:** `Ubuntu` (Google Fonts) is mandatory for all text.
**Theme:** Dark Mode, Neon Financial Colors (Green/Red), Gold Accents.

### 📱 Screens

#### A. Home Screen (Entry)
- **Header:** User's Telegram Name & Total AZC Balance.
- **Center:** Game Logo ("Candle Wick").
- **Menu Buttons:**
  1.  **Start Game** (Primary Action - Pulse Animation).
  2.  **Leaderboard** (Opens global ranking modal).
  3.  **Withdraw** (Disabled - "Coming Soon").
  4.  **Earn Money Systems** (Disabled - "Coming Soon").

#### B. Game Screen (Active)
- **Top Left:** Current Score.
- **Top Right:** Best Score.
- **Center:** The Game Canvas (Candle, Wicks, Obstacles).
- **Feedback:** Floating text (+10, +20 AZC) on events.

#### C. Game Over Modal
- **Title:** "LIQUIDATED!" (Red text).
- **Score:** Final Score vs Best Score.
- **Action Buttons:**
  - [⭐️ Continue with Stars]
  - [🎬 Watch Ad (Left: 3)]
  - [🔄 Restart (Full Width)]

---

## 4. Technical Architecture (Vibe Coding Standards)

### 🛠️ Tech Stack
- **Frontend:** Vite + React 18 + TypeScript.
- **Styling:** TailwindCSS (Gradient usage for candles) + Framer Motion (Animations).
- **Backend:** Firebase (Auth, Firestore).
- **State:** Redux Toolkit (Game State, User Balance).

### 💾 Firebase Data Structure (NoSQL)
**Collection:** `users`
**Document ID:** `telegram_user_id`

{
  "user_id": 123456789,
  "username": "mirsadiq",
  "first_name": "MirSadiq",
  "total_azc": 1500,        // Currency
  "high_score": 320,        // Best run
  "referrals": [],          // List of referred user IDs
  "completed_tasks": [],    // List of task IDs done
  "created_at": "timestamp",
  "last_login": "timestamp"
}

### 🧩 Module Breakdown

  - `features/game/`: Physics engine, collision detection, canvas rendering.
  - `features/ui/`: Menus, Modals, HUD.
  - `features/ads/`: Adsgram integration logic.
  - `features/wallet/`: AZC balance management.

-----

## 5\. Design Assets & Styling

  - **Candles:** CSS/SVG with Drop Shadow (Glow effect).
      - Up: `#22c55e` (Tailwind green-500) + Glow.
      - Down: `#ef4444` (Tailwind red-500) + Glow.
  - **Background:** Dark Grid (Trading View style).
  - **Accents:** Yellow-Orange Gradient (`from-yellow-400 to-orange-500`) for Coins and UI highlights.
