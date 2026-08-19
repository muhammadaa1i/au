import { InvalidJlptLevelError } from "@/domain/errors/DomainError";

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type JlptLevelValue = (typeof JLPT_LEVELS)[number];

export class JlptLevel {
  private constructor(private readonly value: JlptLevelValue) {}

  static of(value: string): JlptLevel {
    if (!JlptLevel.isValid(value)) {
      throw new InvalidJlptLevelError(value);
    }
    return new JlptLevel(value);
  }

  static isValid(value: string): value is JlptLevelValue {
    return (JLPT_LEVELS as readonly string[]).includes(value);
  }

  toString(): JlptLevelValue {
    return this.value;
  }

  equals(other: JlptLevel): boolean {
    return this.value === other.value;
  }
}
