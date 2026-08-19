import { Scenario, ScenarioContent } from "@/domain/entities/Scenario";
import { IdGenerator } from "@/domain/ports/IdGenerator";
import { ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { LearnerProfileId, ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel, JlptLevelValue } from "@/domain/value-objects/JlptLevel";

export interface CreateScenarioInput extends Omit<ScenarioContent, "jlptLevel"> {
  createdById: string;
  jlptLevel: JlptLevelValue;
}

/** Authorization (admin-only) is enforced by the caller — see requireAdmin() at the presentation layer. */
export class CreateScenario {
  constructor(
    private readonly scenarios: ScenarioRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: CreateScenarioInput): Promise<Scenario> {
    const scenario = Scenario.create({
      id: ScenarioId.of(this.ids.generate()),
      createdById: LearnerProfileId.of(input.createdById),
      title: input.title,
      description: input.description,
      category: input.category,
      jlptLevel: JlptLevel.of(input.jlptLevel),
      systemPrompt: input.systemPrompt,
      openingLine: input.openingLine,
    });
    await this.scenarios.save(scenario);
    return scenario;
  }
}
