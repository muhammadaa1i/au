import { describe, expect, it } from "vitest";
import { LearnerProfileId, ScenarioId } from "@/domain/value-objects/ids";
import { InvalidEntityIdError } from "@/domain/errors/DomainError";

describe("EntityId", () => {
  it("rejects an empty value", () => {
    expect(() => LearnerProfileId.of("")).toThrow(InvalidEntityIdError);
    expect(() => LearnerProfileId.of("   ")).toThrow(InvalidEntityIdError);
  });

  it("considers two ids of the same class with the same value equal", () => {
    expect(LearnerProfileId.of("abc").equals(LearnerProfileId.of("abc"))).toBe(true);
  });

  it("considers ids of different classes unequal even with the same value", () => {
    expect(LearnerProfileId.of("abc").equals(ScenarioId.of("abc"))).toBe(false);
  });
});
