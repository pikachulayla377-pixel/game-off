# 🎮 Game API Reference

**Base URL:** `http://localhost:8080/api/v1`

---

## 📌 Quick Summary

| Method | Endpoint | Purpose | Request Body / Param |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check | None |
| `GET` | `/game` | Get all games (full data + images) | None |
| `GET` | `/games/list` | Get slim games list (for dropdowns/search) | None |
| `GET` | `/game/:slug` | Get full game details & items with prices | `slug` in URL |
| `GET` | `/games/:slug/items` | Get only items & prices for a game | `slug` in URL |
| `POST` | `/check-region` | **(Main)** Check player name & region | JSON (`user_id`, `server_id`) |
| `POST` | `/check-region/namecheck` | Validate player name via 1GameStopUp | JSON (`productId`, `playerId`, `zoneId`) |
| `POST` | `/check` | Check player via Busan gateway | JSON (`user_id`, `server_id`, `game`) |

---

## 1. 🕹️ Game Endpoints

### 1.1 `GET /api/v1/game`
* **Why use it:** Loads the main storefront/homepage with all enabled games, logos, and banners.
* **Payload:** None
* **Sample Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "gameName": "Mobile Legends",
        "gameSlug": "mobile-legends114",
        "gameImageId": { "image": "https://res.cloudinary.com/..." }
      }
    ],
    "totalGames": 20
  }
}
```

---

### 1.2 `GET /api/v1/games/list`
* **Why use it:** Super fast, lightweight list for search bars or dropdown menus (no heavy images).
* **Payload:** None
* **Sample Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      { "gameName": "Mobile Legends", "gameSlug": "mobile-legends114" },
      { "gameName": "Genshin Impact", "gameSlug": "genshin-impact265" }
    ],
    "totalGames": 20
  }
}
```

---

### 1.3 `GET /api/v1/game/:slug`
* **Why use it:** Loads the full product page for a single game (shows items, calculated selling prices, input fields like User ID / Zone ID).
* **URL Parameter:** `slug` (e.g. `mobile-legends114`, `mlbb-double332`, `genshin-impact265`)
* **Payload:** None
* **Sample Response:**
```json
{
  "success": true,
  "data": {
    "gameName": "Mobile Legends",
    "gameSlug": "mobile-legends114",
    "playerRequirements": [
      { "name": "User ID", "type": "text", "isRequired": true },
      { "name": "Zone ID", "type": "text", "isRequired": true }
    ],
    "itemId": [
      {
        "itemName": "86 Diamonds",
        "itemSlug": "86-diamonds",
        "sellingPrice": 145,
        "dummyPrice": 180
      }
    ]
  }
}
```

---

### 1.4 `GET /api/v1/games/:slug/items`
* **Why use it:** Quick access to just the pricing & item catalog for a specific game (useful for carts or simple pricing tables).
* **URL Parameter:** `slug` (e.g. `mobile-legends114`)
* **Payload:** None
* **Sample Response:**
```json
{
  "success": true,
  "data": {
    "gameName": "Mobile Legends",
    "gameSlug": "mobile-legends114",
    "items": [
      {
        "itemName": "86 Diamonds",
        "itemSlug": "86-diamonds",
        "sellingPrice": 145,
        "dummyPrice": 180
      }
    ]
  }
}
```

---

## 2. 🔍 Player & Region Verification Endpoints

### 2.1 `POST /api/v1/check-region` *(Smart Multi-Provider Fallback)*
* **Why use it:** Verifies player existence, retrieves in-game nickname, and detects account region before checkout. It automatically tries providers in sequence if any fail or time out:
  1. 🥇 **AcidGameShop**
  2. 🥈 **XPreloads**
  3. 🥉 **DigitalTopup**
  4. 🏅 **CloverShop**
* **Request Body:**
```json
{
  "user_id": "391069103",
  "server_id": "2415",
  "game": "mlbb"
}
```
*(Aliases supported: `id` / `playerId` for `user_id`, `zone` / `zoneId` for `server_id`)*

* **Sample Response:**
```json
{
  "success": 200,
  "message": "Region checked successfully",
  "provider": "AcidGameShop",
  "data": {
    "username": "LaylaGamer",
    "region": "IN",
    "user_id": "391069103",
    "zone": "2415",
    "game": "mlbb",
    "valid": true
  }
}
```

---

### 2.2 `POST /api/v1/check-region/namecheck`
* **Why use it:** Multi-game player name check via 1GameStopUp provider.
* **Request Body:**
```json
{
  "productId": "mobile-legends",
  "playerId": "391069103",
  "zoneId": "2415"
}
```

* **Sample Response:**
```json
{
  "success": 200,
  "message": "Player validated successfully",
  "data": {
    "username": "LaylaGamer",
    "region": "IN",
    "user_id": "391069103",
    "zone": "2415",
    "valid": true
  }
}
```

---

### 2.3 `POST /api/v1/check`
* **Why use it:** Direct verification gateway using the Busan provider API.
* **Request Body:**
```json
{
  "user_id": "391069103",
  "server_id": "2415",
  "game": "mlbb"
}
```

* **Sample Response:**
```json
{
  "success": true,
  "username": "LaylaGamer",
  "zone": "2415",
  "user_id": "391069103"
}
```

---

## 3. 🔄 Legacy Route Aliases
For backward compatibility, the old separate endpoints (`/check-region-xpreload`, `/check-region-prev`, `/check-region-8`) all route to the same unified fallback engine.
