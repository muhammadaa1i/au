import { Scenario } from "@/domain/entities/Scenario";
import { ScenarioFilter, ScenarioRepository } from "@/domain/ports/ScenarioRepository";
import { ScenarioId } from "@/domain/value-objects/ids";

export class FakeScenarioRepository implements ScenarioRepository {
  private readonly scenarios = new Map<string, Scenario>();

  async findById(id: ScenarioId): Promise<Scenario | null> {
    return this.scenarios.get(id.toString()) ?? null;
  }

  async findMany(filter: ScenarioFilter): Promise<Scenario[]> {
    return [...this.scenarios.values()].filter((scenario) => {
      if (filter.onlyPublished && !scenario.isPublished) return false;
      if (filter.jlptLevel && !scenario.jlptLevel.equals(filter.jlptLevel)) return false;
      return true;
    });
  }

  async save(scenario: Scenario): Promise<void> {
    this.scenarios.set(scenario.id.toString(), scenario);
  }

  async delete(id: ScenarioId): Promise<void> {
    this.scenarios.delete(id.toString());
  }

  seed(scenario: Scenario): void {
    this.scenarios.set(scenario.id.toString(), scenario);
  }
}
