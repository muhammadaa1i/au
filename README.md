# Nihongo Talk Trainer

Yapon tili o'rganuvchilari uchun ovozli suhbat mashqi web-ilovasi. Foydalanuvchi suhbat ssenariysini tanlaydi, yaponcha gapiradi (yoki yozadi), sun'iy intellekt tutor sifatida javob beradi va har bir gapga grammatika/tabiiylik bo'yicha baho beradi.

## Arxitektura

Clean Architecture, qatlamlarga ajratilgan holda:

```
src/
  domain/          # Entities, value objects, portlar (interfacelar) — freymvorkdan mustaqil
  application/      # Use case'lar — portlar orqali domain bilan ishlaydi
  infrastructure/   # Prisma repolar, Gemini adapterlar — portlarning haqiqiy implementatsiyasi
  di/                # Composition root (container.ts) — portlarni implementatsiyalar bilan bog'laydi
  app/               # Next.js App Router (presentation)
```

Bog'liqlik yo'nalishi: `app/` → `application/` → `domain/`. `domain/` hech qachon Next.js, Prisma yoki Gemini haqida bilmaydi.

**Muhim arxitektura qarori — talaffuz bahosi**: bepul stek tanlangani sababli (quyida), talaffuz bahosi haqiqiy fonetik audio tahlil emas — brauzerning nutqni tanish ishonchlilik balli (STT confidence) + Gemini orqali matn darajasidagi grammatika/tabiiylik bahosi kombinatsiyasidir. Bu `SpeechFeedbackEvaluator` porti orqali ajratilgan, shuning uchun keyinchalik Azure Pronunciation Assessment kabi aniqroq (lekin pullik) xizmatga almashtirish — faqat yangi adapter yozishni talab qiladi, domain/application qatlamlariga tegmasdan.

## Stek

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI asosida)
- Clerk — autentifikatsiya
- Prisma 7 + PostgreSQL — ma'lumotlar bazasi
- Google Gemini API — suhbat generatsiyasi va nutq bahosi (bepul tier)
- Brauzer Web Speech API — ovozni matnga aylantirish (STT) va matnni ovozga aylantirish (TTS), bepul
- Vitest — domain va application qatlamlari uchun unit testlar (TDD, fake adapterlar bilan)

## Sozlash

### 1. Muhit o'zgaruvchilari

`.env.example`dan nusxa oling va to'ldiring:

```bash
cp .env.example .env
```

- **`DATABASE_URL`** — Postgres ulanish satri. Bepul variant: [Neon](https://neon.tech) yoki [Supabase](https://supabase.com), yoki lokal Docker Postgres.
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**, **`CLERK_SECRET_KEY`** — [Clerk dashboard](https://dashboard.clerk.com)dan (bepul tier).
- **`CLERK_WEBHOOK_SIGNING_SECRET`** — Clerk dashboardida Webhooks bo'limidan `user.created` eventiga endpoint qo'shing (`/api/webhooks/clerk`), signing secretni shu yerga qo'ying. Bu — foydalanuvchi ro'yxatdan o'tganda avtomatik `LearnerProfile` yaratish uchun kerak (agar sozlanmasa, profil birinchi himoyalangan sahifaga kirishda "lazy" yaratiladi — ilova baribir ishlayveradi, lekin webhook tavsiya etiladi).
- **`GEMINI_API_KEY`** — [Google AI Studio](https://aistudio.google.com/apikey)dan bepul API kalit oling.

### 2. Ma'lumotlar bazasi

```bash
npm run db:migrate    # jadvallarni yaratish
npm run db:seed        # 3 ta boshlang'ich ssenariy + admin profilini qo'shish
```

Birinchi admin: `.env`ga `SEED_ADMIN_CLERK_USER_ID=<sizning Clerk user ID'ingiz>` qo'shib, so'ng `npm run db:seed`ni qayta ishga tushiring (avval ilovada ro'yxatdan o'tgan bo'lishingiz kerak, Clerk user ID Clerk dashboardida ko'rinadi).

### 3. Ishga tushirish

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) — `/uz`, `/en` yoki `/ru`ga yo'naltiradi.

## Testlar

```bash
npm run test          # domain + application unit testlar (fake adapterlar, DB/tarmoqsiz)
npm run test:watch
```

## Ma'lum cheklovlar (MVP)

- Ovozni tanish (Web Speech API) asosan Chrome/Edge'da ishlaydi — Safari/Firefox'da qo'llab-quvvatlash cheklangan. Qo'llab-quvvatlanmasa, ilova matn kiritish maydoniga avtomatik tushadi.
- Talaffuz bahosi taxminiy (yuqoridagi arxitektura izohiga qarang) — fonetik audio tahlil emas.
- E2E testlar (Playwright) hali qo'shilmagan — keyingi bosqich sifatida qo'shish tavsiya etiladi.
