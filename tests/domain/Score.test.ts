import { describe, expect, it } from "vitest";
import { Score } from "@/domain/value-objects/Score";
import { InvalidScoreError } from "@/domain/errors/DomainError";

describe("Score", () => {
  it("accepts integers from 0 to 100", () => {
    expect(Score.of(0).valueOf()).toBe(0);
    expect(Score.of(100).valueOf()).toBe(100);
    expect(Score.of(72).valueOf()).toBe(72);
  });

  it.each([-1, 101, 3.5])("rejects out-of-range or non-integer value %s", (value) => {
    expect(() => Score.of(value)).toThrow(InvalidScoreError);
  });

  it("averages a list of scores, rounded to the nearest integer", () => {
    const average = Score.average([Score.of(80), Score.of(90), Score.of(70)]);
    expect(average.valueOf()).toBe(80);
  });

  it("averages to 0 for an empty list", () => {
    expect(Score.average([]).valueOf()).toBe(0);
  });
});
