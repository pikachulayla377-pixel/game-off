# Website API Reference

**Base URL:** `http://localhost:8081/api/v1` *(uses `PORT` from `.env`, defaults to `8080`)*  
**Health Check:** `GET http://localhost:8081/` → `"✅ Game API Server Running"`

---

## Endpoints at a Glance

| Method | Endpoint | Where to Use on Website |
| :--- | :--- | :--- |
| `GET` | `/game` | Homepage / Storefront (all games + images) |
| `GET` | `/games/list` | Search bar / Dropdowns (names & slugs only) |
| `GET` | `/game/:slug` | Game product page (items, prices, input fields) |
| `GET` | `/games/:slug/items` | Cart / Pricing table (items & prices only) |
| `POST` | `/check-region` | Checkout / Player verification (auto-fallback) |
| `POST` | `/check-region/namecheck` | Multi-game player name check (1GameStopUp) |
| `POST` | `/check` | Direct player check (Busan gateway) |
| `POST` | `/admin/sync-dump` | Admin form trigger for sync & dump |

---

## 1. Games & Products

### `GET /api/v1/game`
Load all enabled games with images for the homepage/storefront.

**Response:**
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

### `GET /api/v1/games/list`
Lightweight list of game names and slugs (no images) for search bars or dropdowns.

**Response:**
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

### `GET /api/v1/game/:slug`
Full details for a single game page, including required player inputs (`User ID`, `Zone ID`, etc.) and items with calculated prices.

**Example:** `GET /api/v1/game/mobile-legends114`

**Response:**
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

### `GET /api/v1/games/:slug/items`
Only the items and prices for a game (useful for cart validation or price tables).

**Example:** `GET /api/v1/games/mobile-legends114/items`

**Response:**
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

## 2. Player & Region Verification

> **Accepted Field Aliases:**  
> - User ID: `user_id`, `id`, or `playerId`  
> - Server/Zone ID: `server_id`, `zone`, or `zoneId`

### `POST /api/v1/check-region` *(Recommended)*
Verifies a player's username and region. Automatically falls back across 4 providers in order: `AcidGameShop` → `XPreloads` → `DigitalTopup` → `CloverShop`.

**Body:**
```json
{
  "user_id": "391069103",
  "server_id": "2415",
  "game": "mlbb"
}
```

**Success Response:**
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

*(Legacy aliases `/check-region-xpreload`, `/check-region-prev`, and `/check-region-8` point to this same endpoint.)*

### `POST /api/v1/check-region/namecheck`
Validates a player name across supported games via 1GameStopUp.

**Body:**
```json
{
  "productId": "mobile-legends",
  "playerId": "391069103",
  "zoneId": "2415"
}
```
*(Also accepts `game` instead of `productId`; `zoneId` defaults to `"NA"` if omitted.)*

**Success Response:**
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

### `POST /api/v1/check`
Direct player check via the Busan gateway (`BUSAN_BASE_URL`).

**Body:**
```json
{
  "user_id": "391069103",
  "server_id": "2415",
  "game": "mlbb"
}
```
*(`game` defaults to `"mlbb"`, and `server_id` is optional.)*

**Success Response:**
```json
{
  "success": true,
  "username": "LaylaGamer",
  "zone": "2415",
  "user_id": "391069103"
}
```

---

## 3. Admin (Sync & Dump)

### `POST /api/v1/admin/sync-dump`
Triggers game sync (`syncGames`) and/or game details dump (`dumpGameDetails`) remotely from an admin form.

**Headers:**
```
x-admin-key: <ADMIN_SECRET from .env>
```

**Body:**
```json
{
  "authorization": "Bearer eyJhbG...",
  "cookie": "refreshToken=...; accessToken=...",
  "runSync": true,
  "runDump": true
}
```
*(`authorization` and `cookie` fall back to `.env` if omitted; `runSync` and `runDump` default to `true`.)*

**Success Response:**
```json
{
  "success": true,
  "sync": { "deletedCount": 20, "syncedCount": 20 },
  "dump": { "deletedCount": 20, "totalSlugs": 20, "dumpedCount": 20, "failedCount": 0, "failed": [] }
}
```
