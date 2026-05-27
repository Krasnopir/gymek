# Deploy Gymek on Render

Архитектура: **2 Web Service** в одном monorepo.

| Service | Что крутит | URL пример |
|---------|------------|------------|
| `gymek-api` | Express API | `https://gymek-api.onrender.com` |
| `gymek-web` | TanStack Start (Nitro SSR) | `https://gymek-web.onrender.com` |

Auth/DB остаются в Supabase.

## 1. Подключить репозиторий

1. [Render Dashboard](https://dashboard.render.com/) → **New +** → **Blueprint**
2. Connect GitHub → репозиторий `Krasnopir/gymek`
3. Render подхватит `render.yaml` из корня

## 2. Секреты при создании сервисов

Заполни в UI (или Environment → Add Secret):

### gymek-api

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://lgdrmylocbdoxtfpsjez.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role из Supabase |
| `OPENAI_API_KEY` | твой OpenAI key |
| `GEMINI_API_KEY` | твой Gemini key |
| `GEMINI_PROJECT_NUMBER` | `123160449769` |
| `APP_BASE_URL` | пока оставь пустым, заполнишь после шага 4 |

### gymek-web

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://lgdrmylocbdoxtfpsjez.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | publishable key |

`VITE_API_BASE_URL` подтянется автоматически из `gymek-api` (`RENDER_EXTERNAL_URL`).

## 3. Порядок первого деплоя

1. Дождись зелёного деплоя **gymek-api**
2. Открой API URL → `GET /health` должен вернуть `{ ok: true }`
3. Дождись деплоя **gymek-web**
4. Скопируй URL web-сервиса (например `https://gymek-web.onrender.com`)
5. В **gymek-api** → Environment → `APP_BASE_URL` = URL web-сервиса
6. **Manual Deploy** для `gymek-api` (перезапуск CORS)

## 4. Supabase после Render

**Authentication → URL Configuration:**

| Поле | Значение |
|------|----------|
| Site URL | `https://gymek-web.onrender.com` |
| Redirect URLs | `https://gymek-web.onrender.com/**` |

## 5. Google OAuth (production)

В Google Cloud → OAuth client добавь:

- **Authorized JavaScript origins:** `https://gymek-web.onrender.com`
- **Authorized redirect URIs:** (без изменений)  
  `https://lgdrmylocbdoxtfpsjez.supabase.co/auth/v1/callback`

## 6. Проверка

1. Открой web URL
2. Google login
3. Onboarding → Save (должен уйти на API без CORS error)

## Free tier caveats

- Сервисы засыпают после ~15 мин простоя (cold start 30–60 сек)
- Для личного use ок; для daily driver — paid plan или cron ping

## Локальная отладка production build

```bash
pnpm build
PORT=8787 pnpm start:api
PORT=3000 pnpm start:web
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| CORS error | `APP_BASE_URL` на API = точный URL web (без `/` в конце) |
| Web build без API | Пересобери web после того как API задеплоился |
| 502 на web | Проверь логи, `start` = `node .output/server/index.mjs` |
| **500 на web** (`HTTPError`) | Не заданы `VITE_*` **до сборки**. Environment → добавь ключи → **Clear build cache & deploy** |
| OAuth redirect | Site URL в Supabase = web Render URL |
