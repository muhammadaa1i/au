import { describe, expect, it } from "vitest";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { InvalidJlptLevelError } from "@/domain/errors/DomainError";

describe("JlptLevel", () => {
  it("accepts each of the five official JLPT levels", () => {
    for (const level of ["N5", "N4", "N3", "N2", "N1"]) {
      expect(JlptLevel.of(level).toString()).toBe(level);
    }
  });

  it("throws InvalidJlptLevelError for an unknown level", () => {
    expect(() => JlptLevel.of("N6")).toThrow(InvalidJlptLevelError);
  });

  it("treats two levels with the same value as equal", () => {
    expect(JlptLevel.of("N3").equals(JlptLevel.of("N3"))).toBe(true);
    expect(JlptLevel.of("N3").equals(JlptLevel.of("N2"))).toBe(false);
  });
});
