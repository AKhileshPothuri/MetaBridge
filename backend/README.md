# AutoBI Migrator Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your dev/prod DB credentials.
2. Install dependencies:
   ```
   poetry install
   ```
3. Run the server:
   ```
   poetry run uvicorn app.main:app --reload
   ```

## Endpoints

- `GET /systems/` — List and compare systems in dev/prod
- `POST /systems/sync/{systemid}` — Sync a system from dev to prod
- `GET /roles/` — List and compare roles in dev/prod
- `POST /roles/sync/{roleid}` — Sync a role from dev to prod
- `GET /categories/` — List and compare categories in dev/prod
- `POST /categories/sync/{categoryid}` — Sync a category from dev to prod
- `GET /catalogs/` — List and compare catalogs in dev/prod
- `POST /catalogs/sync/{tableid}` — Sync a catalog from dev to prod
- `GET /contexts/` — List and compare contexts in dev/prod
- `POST /contexts/sync/{contextid}` — Sync a context from dev to prod 