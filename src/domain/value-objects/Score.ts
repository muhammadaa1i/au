import { InvalidScoreError } from "@/domain/errors/DomainError";

export class Score {
  private constructor(private readonly value: number) {}

  static of(value: number): Score {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new InvalidScoreError(value);
    }
    return new Score(value);
  }

  static average(scores: Score[]): Score {
    if (scores.length === 0) {
      return Score.of(0);
    }
    const total = scores.reduce((sum, score) => sum + score.valueOf(), 0);
    return Score.of(Math.round(total / scores.length));
  }

  valueOf(): number {
    return this.value;
  }
}
