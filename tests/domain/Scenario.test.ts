import { describe, expect, it } from "vitest";
import { Scenario } from "@/domain/entities/Scenario";
import { InvalidScenarioError } from "@/domain/errors/DomainError";
import { LearnerProfileId, ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";

function buildValidContent() {
  return {
    id: ScenarioId.of("scenario-1"),
    createdById: LearnerProfileId.of("teacher-1"),
    title: "Do'konda xarid qilish",
    description: "Practice buying groceries at a konbini.",
    category: "shopping",
    jlptLevel: JlptLevel.of("N5"),
    systemPrompt: "You are a friendly konbini clerk in Tokyo...",
    openingLine: "いらっしゃいませ！",
  };
}

describe("Scenario", () => {
  it("is created unpublished", () => {
    const scenario = Scenario.create(buildValidContent());
    expect(scenario.isPublished).toBe(false);
  });

  it.each(["title", "description", "category", "systemPrompt", "openingLine"] as const)(
    "rejects creation when %s is blank",
    (field) => {
      const content = { ...buildValidContent(), [field]: "   " };
      expect(() => Scenario.create(content)).toThrow(InvalidScenarioError);
    },
  );

  it("can be published and unpublished", () => {
    const scenario = Scenario.create(buildValidContent());
    scenario.publish();
    expect(scenario.isPublished).toBe(true);
    scenario.unpublish();
    expect(scenario.isPublished).toBe(false);
  });

  it("rejects updateContent when the new content is invalid", () => {
    const scenario = Scenario.create(buildValidContent());
    expect(() => scenario.updateContent({ ...buildValidContent(), title: "" })).toThrow(
      InvalidScenarioError,
    );
    expect(scenario.title).toBe("Do'konda xarid qilish");
  });
});
