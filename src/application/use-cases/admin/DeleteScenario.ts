import { NotFoundError } from "@/application/errors/ApplicationError";
import { ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { ScenarioId } from "@/domain/value-objects/ids";

export class DeleteScenario {
  constructor(private readonly scenarios: ScenarioRepository) {}

  async execute(id: string): Promise<void> {
    const scenarioId = ScenarioId.of(id);
    const scenario = await this.scenarios.findById(scenarioId);
    if (!scenario) {
      throw new NotFoundError(`Scenario "${id}" not found`);
    }
    await this.scenarios.delete(scenarioId);
  }
}
