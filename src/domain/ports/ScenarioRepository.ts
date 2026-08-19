import { Scenario } from "@/domain/entities/Scenario";
import { ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";

export interface ScenarioFilter {
  jlptLevel?: JlptLevel;
  onlyPublished?: boolean;
}

export interface ScenarioRepository {
  findById(id: ScenarioId): Promise<Scenario | null>;
  findMany(filter: ScenarioFilter): Promise<Scenario[]>;
  save(scenario: Scenario): Promise<void>;
  delete(id: ScenarioId): Promise<void>;
}
