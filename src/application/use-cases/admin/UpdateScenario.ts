import { NotFoundError } from "@/application/errors/ApplicationError";
import { Scenario, ScenarioContent } from "@/domain/entities/Scenario";
import { ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel, JlptLevelValue } from "@/domain/value-objects/JlptLevel";

export interface UpdateScenarioInput extends Omit<ScenarioContent, "jlptLevel"> {
  id: string;
  jlptLevel: JlptLevelValue;
}

export class UpdateScenario {
  constructor(private readonly scenarios: ScenarioRepository) {}

  async execute(input: UpdateScenarioInput): Promise<Scenario> {
    const scenario = await this.scenarios.findById(ScenarioId.of(input.id));
    if (!scenario) {
      throw new NotFoundError(`Scenario "${input.id}" not found`);
    }
    scenario.updateContent({
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
