import { NotFoundError } from "@/application/errors/ApplicationError";
import { Scenario } from "@/domain/entities/Scenario";
import { ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { ScenarioId } from "@/domain/value-objects/ids";

export class SetScenarioPublished {
  constructor(private readonly scenarios: ScenarioRepository) {}

  async execute(id: string, isPublished: boolean): Promise<Scenario> {
    const scenario = await this.scenarios.findById(ScenarioId.of(id));
    if (!scenario) {
      throw new NotFoundError(`Scenario "${id}" not found`);
    }
    if (isPublished) {
      scenario.publish();
    } else {
      scenario.unpublish();
    }
    await this.scenarios.save(scenario);
    return scenario;
  }
}
