import { NotFoundError } from "@/application/errors/ApplicationError";
import { Scenario } from "@/domain/entities/Scenario";
import { ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { ScenarioId } from "@/domain/value-objects/ids";

export class GetScenario {
  constructor(private readonly scenarios: ScenarioRepository) {}

  async execute(id: string): Promise<Scenario> {
    const scenario = await this.scenarios.findById(ScenarioId.of(id));
    if (!scenario) {
      throw new NotFoundError(`Scenario "${id}" not found`);
    }
    return scenario;
  }
}
