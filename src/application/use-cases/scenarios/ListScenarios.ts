import { Scenario } from "@/domain/entities/Scenario";
import { ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { JlptLevel, JlptLevelValue } from "@/domain/value-objects/JlptLevel";

export interface ListScenariosInput {
  jlptLevel?: JlptLevelValue;
  onlyPublished?: boolean;
}

export class ListScenarios {
  constructor(private readonly scenarios: ScenarioRepository) {}

  async execute(input: ListScenariosInput = {}): Promise<Scenario[]> {
    return this.scenarios.findMany({
      jlptLevel: input.jlptLevel ? JlptLevel.of(input.jlptLevel) : undefined,
      onlyPublished: input.onlyPublished,
    });
  }
}
