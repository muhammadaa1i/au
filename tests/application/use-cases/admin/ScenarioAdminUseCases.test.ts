import { describe, expect, it } from "vitest";
import { CreateScenario } from "@/application/use-cases/admin/CreateScenario";
import { UpdateScenario } from "@/application/use-cases/admin/UpdateScenario";
import { SetScenarioPublished } from "@/application/use-cases/admin/SetScenarioPublished";
import { DeleteScenario } from "@/application/use-cases/admin/DeleteScenario";
import { NotFoundError } from "@/application/errors/ApplicationError";
import { ScenarioId } from "@/domain/value-objects/ids";
import { FakeScenarioRepository } from "../../fakes/FakeScenarioRepository";
import { FakeIdGenerator } from "../../fakes/FakeIdGenerator";

function validInput(overrides: Partial<Parameters<CreateScenario["execute"]>[0]> = {}) {
  return {
    createdById: "teacher-1",
    title: "Restoranda buyurtma berish",
    description: "Order food at a restaurant.",
    category: "restaurant",
    jlptLevel: "N4" as const,
    systemPrompt: "You are a waiter at a ramen shop...",
    openingLine: "ご注文はお決まりですか？",
    ...overrides,
  };
}

describe("CreateScenario", () => {
  it("creates an unpublished scenario with a generated id", async () => {
    const repo = new FakeScenarioRepository();
    const scenario = await new CreateScenario(repo, new FakeIdGenerator()).execute(validInput());

    expect(scenario.isPublished).toBe(false);
    expect(await repo.findById(scenario.id)).toBe(scenario);
  });
});

describe("UpdateScenario", () => {
  it("updates existing scenario content", async () => {
    const repo = new FakeScenarioRepository();
    const created = await new CreateScenario(repo, new FakeIdGenerator()).execute(validInput());

    const updated = await new UpdateScenario(repo).execute({
      ...validInput({ title: "Yangi sarlavha" }),
      id: created.id.toString(),
    });

    expect(updated.title).toBe("Yangi sarlavha");
  });

  it("throws NotFoundError for an unknown scenario", async () => {
    const repo = new FakeScenarioRepository();
    await expect(
      new UpdateScenario(repo).execute({ ...validInput(), id: "missing" }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("SetScenarioPublished", () => {
  it("publishes and unpublishes a scenario", async () => {
    const repo = new FakeScenarioRepository();
    const created = await new CreateScenario(repo, new FakeIdGenerator()).execute(validInput());
    const useCase = new SetScenarioPublished(repo);

    const published = await useCase.execute(created.id.toString(), true);
    expect(published.isPublished).toBe(true);

    const unpublished = await useCase.execute(created.id.toString(), false);
    expect(unpublished.isPublished).toBe(false);
  });
});

describe("DeleteScenario", () => {
  it("removes an existing scenario", async () => {
    const repo = new FakeScenarioRepository();
    const created = await new CreateScenario(repo, new FakeIdGenerator()).execute(validInput());

    await new DeleteScenario(repo).execute(created.id.toString());

    expect(await repo.findById(created.id)).toBeNull();
  });

  it("throws NotFoundError when the scenario does not exist", async () => {
    const repo = new FakeScenarioRepository();
    await expect(new DeleteScenario(repo).execute(ScenarioId.of("missing").toString())).rejects.toThrow(
      NotFoundError,
    );
  });
});
