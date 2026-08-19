import { describe, expect, it } from "vitest";
import { ListScenarios } from "@/application/use-cases/scenarios/ListScenarios";
import { Scenario } from "@/domain/entities/Scenario";
import { LearnerProfileId, ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { FakeScenarioRepository } from "../../fakes/FakeScenarioRepository";

function buildScenario(id: string, level: string, published: boolean) {
  const scenario = Scenario.create({
    id: ScenarioId.of(id),
    createdById: LearnerProfileId.of("teacher-1"),
    title: `Scenario ${id}`,
    description: "desc",
    category: "shopping",
    jlptLevel: JlptLevel.of(level),
    systemPrompt: "prompt",
    openingLine: "いらっしゃいませ",
  });
  if (published) scenario.publish();
  return scenario;
}

describe("ListScenarios", () => {
  it("filters by publication status", async () => {
    const repo = new FakeScenarioRepository();
    repo.seed(buildScenario("1", "N5", true));
    repo.seed(buildScenario("2", "N5", false));

    const result = await new ListScenarios(repo).execute({ onlyPublished: true });

    expect(result.map((s) => s.id.toString())).toEqual(["1"]);
  });

  it("filters by JLPT level", async () => {
    const repo = new FakeScenarioRepository();
    repo.seed(buildScenario("1", "N5", true));
    repo.seed(buildScenario("2", "N3", true));

    const result = await new ListScenarios(repo).execute({ jlptLevel: "N3" });

    expect(result.map((s) => s.id.toString())).toEqual(["2"]);
  });

  it("returns everything when no filter is given", async () => {
    const repo = new FakeScenarioRepository();
    repo.seed(buildScenario("1", "N5", true));
    repo.seed(buildScenario("2", "N3", false));

    const result = await new ListScenarios(repo).execute();

    expect(result).toHaveLength(2);
  });
});
