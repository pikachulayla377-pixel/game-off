# API Endpoints

Base URL: `http://localhost:8081`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Server health check |
| `GET` | `/admin` | Admin UI for syncing games and dumping details |
| `GET` | `/admin/pricing` | Admin UI for updating `USD_TO_INR_RATIO` |
| `GET` | `/api/v1/game` | Get all enabled games with images |
| `GET` | `/api/v1/games/list` | Get slim list of game names and slugs |
| `GET` | `/api/v1/game/:slug` | Get full game details, requirements, and priced items |
| `GET` | `/api/v1/games/:slug/items` | Get only items and prices for a game |
| `POST` | `/api/v1/check-region` | Check player username and region with auto-fallback |
| `POST` | `/api/v1/check-region/namecheck` | Validate player name via 1GameStopUp |
| `POST` | `/api/v1/check` | Check player via Busan gateway |
| `POST` | `/api/v1/admin/sync-dump` | Trigger game sync and details dump |
| `GET` | `/api/v1/admin/pricing` | Get current pricing config |
| `POST` | `/api/v1/admin/pricing` | Update pricing config |
