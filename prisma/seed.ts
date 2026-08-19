import "dotenv/config";
import { prisma } from "../src/infrastructure/persistence/prisma/client";
import { container } from "../src/di/container";
import type { JlptLevelValue } from "../src/domain/value-objects/JlptLevel";

const SYSTEM_CLERK_USER_ID = "system";

interface SeedScenario {
  title: string;
  description: string;
  category: string;
  jlptLevel: JlptLevelValue;
  systemPrompt: string;
  openingLine: string;
}

const scenarios: SeedScenario[] = [
  {
    title: "O'zingizni tanishtirish",
    description: "Yangi tanishuvda o'zingiz haqingizda gapiring: ism, kasb, qayerdan ekanligingiz.",
    category: "self-introduction",
    jlptLevel: "N5",
    systemPrompt:
      "You are a friendly Japanese person meeting the learner for the first time at a language exchange event. Ask simple follow-up questions about their name, where they're from, and what they do. Keep your Japanese very simple (N5 level: basic greetings, desu/masu form, simple particles).",
    openingLine: "はじめまして。お名前は何ですか？",
  },
  {
    title: "Konbinida xarid qilish",
    description: "Yaqin atrofdagi konbini (do'kon)da mahsulot sotib oling.",
    category: "shopping",
    jlptLevel: "N5",
    systemPrompt:
      "You are a convenience store (konbini) clerk in Japan. Greet the customer, ask what they'd like, mention the price, and ask if they need a bag. Keep vocabulary and grammar at N5 level.",
    openingLine: "いらっしゃいませ！何をお探しですか？",
  },
  {
    title: "Restoranda buyurtma berish",
    description: "Restoranda ovqat va ichimlik buyurtma qiling.",
    category: "restaurant",
    jlptLevel: "N4",
    systemPrompt:
      "You are a waiter at a casual Japanese restaurant. Greet the guest, recommend a dish or two if asked, take their order, and confirm it back to them. Keep the Japanese at N4 level: common verbs in te-form, basic keigo (desu/masu), simple requests.",
    openingLine: "ご注文はお決まりですか？",
  },
];

async function ensureSystemAdminProfile(): Promise<string> {
  const profile = await prisma.learnerProfile.upsert({
    where: { clerkUserId: SYSTEM_CLERK_USER_ID },
    create: {
      clerkUserId: SYSTEM_CLERK_USER_ID,
      displayName: "Nihongo Talk Trainer",
      uiLanguage: "uz",
      jlptLevel: "N5",
      role: "admin",
    },
    update: {},
  });
  return profile.id;
}

async function promoteConfiguredAdmin(): Promise<void> {
  const clerkUserId = process.env.SEED_ADMIN_CLERK_USER_ID;
  if (!clerkUserId) return;

  const profile = await prisma.learnerProfile.findUnique({ where: { clerkUserId } });
  if (!profile) {
    console.warn(
      `SEED_ADMIN_CLERK_USER_ID="${clerkUserId}" uchun profil topilmadi — avval ilovaga ro'yxatdan o'ting, so'ng seedni qayta ishga tushiring.`,
    );
    return;
  }

  await prisma.learnerProfile.update({ where: { clerkUserId }, data: { role: "admin" } });
  console.log(`Admin huquqi berildi: ${clerkUserId}`);
}

async function seedScenarios(createdById: string): Promise<void> {
  for (const scenario of scenarios) {
    const existing = await prisma.scenario.findFirst({ where: { title: scenario.title } });
    if (existing) {
      console.log(`O'tkazib yuborildi (allaqachon mavjud): ${scenario.title}`);
      continue;
    }
    const created = await container.createScenario.execute({ createdById, ...scenario });
    await container.setScenarioPublished.execute(created.id.toString(), true);
    console.log(`Yaratildi va chop etildi: ${scenario.title}`);
  }
}

async function main(): Promise<void> {
  const systemProfileId = await ensureSystemAdminProfile();
  await promoteConfiguredAdmin();
  await seedScenarios(systemProfileId);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
