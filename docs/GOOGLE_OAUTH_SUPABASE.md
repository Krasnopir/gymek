# Google OAuth + Supabase для Gymek

Проект: `lgdrmylocbdoxtfpsjez`  
URL: `https://lgdrmylocbdoxtfpsjez.supabase.co`

## Часть 1 — Google Cloud Console

1. Открой [Google Cloud Console](https://console.cloud.google.com/).
2. Выбери проект с номером `123160449769` (или создай новый).
3. **APIs & Services → Library** → включи **Google+ API** / **Google Identity** (если попросит).
4. **APIs & Services → OAuth consent screen**:
   - User Type: **External** (для личного/друзей) или Internal (если Google Workspace).
   - App name: `Gymek`
   - Support email: твой email
   - Authorized domains: добавь `supabase.co` (и позже свой домен, если будет)
   - Scopes: минимум `email`, `profile`, `openid`
   - Test users: добавь свой Google email (пока app в Testing)
5. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Gymek Supabase Auth`
   - **Authorized JavaScript origins** (добавь оба):
     - `http://localhost:3000`
     - `https://lgdrmylocbdoxtfpsjez.supabase.co`
   - **Authorized redirect URIs** (критично, копируй точно):
     - `https://lgdrmylocbdoxtfpsjez.supabase.co/auth/v1/callback`
     - `http://localhost:3000` (для dev, если Supabase попросит site URL)
6. Сохрани:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

## Часть 2 — Supabase Dashboard

1. [Supabase Dashboard](https://supabase.com/dashboard/project/lgdrmylocbdoxtfpsjez) → **Authentication → Providers**.
2. Найди **Google** → включи (Enable).
3. Вставь:
   - Client ID (из Google)
   - Client Secret (из Google)
4. Сохрани.

## Часть 3 — URL Configuration в Supabase

**Authentication → URL Configuration**:

| Поле | Значение (dev) |
|------|----------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/**` |

Для production добавь позже:
- Site URL: `https://<твой-домен>`
- Redirect URLs: `https://<твой-домен>/**`

## Часть 4 — Проверка в Gymek

1. Убедись, что в `apps/web/.env`:
   - `VITE_SUPABASE_URL=https://lgdrmylocbdoxtfpsjez.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_...`
2. Запусти:
   ```bash
   pnpm dev
   ```
3. Открой `http://localhost:3000` → **Continue with Google**.
4. После логина в Supabase → **Authentication → Users** должен появиться пользователь.
5. В **Table Editor → profiles** должна появиться строка (триггер из миграции `20260527105000`).

## Часть 5 — Service Role для API (обязательно)

API (`apps/api`) использует admin-клиент Supabase.

1. Supabase → **Project Settings → API**
2. Скопируй **service_role** key (секретный, не в frontend!)
3. Вставь в `apps/api/.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
   ```
4. Перезапусти API.

## Типичные ошибки

| Симптом | Причина | Фикс |
|---------|---------|------|
| `redirect_uri_mismatch` | Неверный callback в Google | Добавь `https://lgdrmylocbdoxtfpsjez.supabase.co/auth/v1/callback` |
| Возврат на localhost без сессии | Site URL / Redirect URLs | Проверь URL Configuration в Supabase |
| `Access blocked: app not verified` | OAuth в Testing | Добавь email в Test users |
| Профиль не создаётся | Миграция не накатилась | Проверь trigger `on_auth_user_created_profile` |
| API 500 на onboarding | Нет service_role | Добавь `SUPABASE_SERVICE_ROLE_KEY` |

## Безопасность

- `sb_publishable_...` — только во frontend (`apps/web`)
- `service_role` — только в `apps/api`, никогда в GitHub/Pages
- Ротируй ключи, если они попали в чат/скрин
