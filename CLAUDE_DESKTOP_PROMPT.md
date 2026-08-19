I have a Next.js app called "Nihongo Talk Trainer" already built at `C:\Users\muham\Desktop\Projects\au` — a Japanese conversation-practice web app (voice chat with an AI tutor, JLPT-level scenarios, grammar/naturalness feedback, admin panel). It was built with Clean Architecture (`src/domain` → `src/application` → `src/infrastructure`/`src/app`, composition root at `src/di/container.ts`), Next.js 16 + React 19 + TypeScript, Tailwind + shadcn/ui (Base UI variant, so polymorphic components use `render={<Link/>}` not `asChild`), Clerk auth, Prisma 7 + Postgres, Gemini API for the LLM (conversation + feedback), and the browser's native Web Speech API for STT/TTS. 59 unit tests pass, `tsc --noEmit` is clean, `next build` succeeds. Read `README.md` in that folder first for the full setup/architecture rundown before doing anything else.

Four things are still open. Please work through them in order, checking in with me wherever you need something only I can provide (API keys, account creation, choices):

## 1. Get the app actually runnable — fill in `.env`

`.env.example` lists what's needed: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `GEMINI_API_KEY`. Walk me through getting each one (Clerk dashboard, a free Postgres instance — Neon or Supabase — and a Gemini API key from Google AI Studio), and help me set up the Clerk webhook endpoint (`/api/webhooks/clerk`, `user.created` event) pointing at my dev URL. Don't invent or guess values — ask me for each credential as you go, and don't proceed to step 2 until `.env` is filled in for real.

## 2. Initialize the database

Once `DATABASE_URL` is real: run `npm run db:migrate` to create the tables, then `npm run db:seed` to load the 3 starter scenarios and the system admin profile. If I want to be an admin myself (not just the seeded "system" account), help me find my own Clerk user ID and set `SEED_ADMIN_CLERK_USER_ID` in `.env` before re-running the seed, per the README's instructions.

Then run `npm run dev` and actually exercise the app in a browser with me — sign up, do onboarding, start a practice scenario, speak or type a turn, confirm the tutor reply and feedback come back correctly, end a session, check it shows up in history, and check the admin panel scenario CRUD. This is a voice/browser-API-heavy app — don't claim it works without actually driving it in a real browser.

## 3. Add E2E tests (Playwright)

Not present yet. Set up Playwright following the project's existing testing conventions (Vitest is used for domain/application unit tests with fake adapters — see `tests/` — keep that separate; Playwright should live in its own `e2e/` directory and hit a real running dev server + seeded DB). Cover at minimum: sign-up → onboarding → start a scenario → send a typed message (mock or stub the Gemini calls so tests aren't flaky/costly — check how `GeminiConversationGenerator`/`GeminiSpeechFeedbackEvaluator` are wired in `src/di/container.ts` and design a test-friendly way to swap them, e.g. an env-gated fake adapter) → end session → see it in history. Also cover the admin scenario CRUD happy path and the auth/role guards (non-admin blocked from `/admin`). Don't test the actual Web Speech API (it's not automatable in headless Chromium reliably) — test the typed-text fallback path instead, which exercises the same server actions.

## 4. Optional: upgrade the pronunciation-scoring pipeline

This is a known, documented tradeoff (see README's "Ma'lum cheklovlar" section) — the free Web Speech API pipeline gives STT-confidence + LLM text judgment, not real phoneme-level pronunciation analysis. The architecture already isolates this behind the `SpeechFeedbackEvaluator` port in `src/domain/ports/`, so swapping in something like Azure Pronunciation Assessment later is a new adapter, not a rewrite. Only do this if I explicitly ask for it — it's a paid service and a bigger scope decision, so raise it with me rather than just building it.

Work incrementally, keep using the existing Clean Architecture conventions (ports in `domain`, adapters in `infrastructure`, composition root in `di/container.ts`), and don't touch the domain/application layers unless a real requirement forces it — they're fully tested and stable.
