import { Score } from "@/domain/value-objects/Score";

export interface LanguageFeedbackProps {
  overallScore: Score;
  grammarNotes: string[];
  naturalnessNotes: string[];
  suggestedCorrection?: string;
}

export interface LanguageFeedbackJSON {
  overallScore: number;
  grammarNotes: string[];
  naturalnessNotes: string[];
  suggestedCorrection: string | null;
}

export class LanguageFeedback {
  private constructor(private readonly props: LanguageFeedbackProps) {}

  static create(props: LanguageFeedbackProps): LanguageFeedback {
    return new LanguageFeedback(props);
  }

  static fromJSON(json: LanguageFeedbackJSON): LanguageFeedback {
    return new LanguageFeedback({
      overallScore: Score.of(json.overallScore),
      grammarNotes: json.grammarNotes,
      naturalnessNotes: json.naturalnessNotes,
      suggestedCorrection: json.suggestedCorrection ?? undefined,
    });
  }

  get overallScore(): Score {
    return this.props.overallScore;
  }

  get grammarNotes(): readonly string[] {
    return this.props.grammarNotes;
  }

  get naturalnessNotes(): readonly string[] {
    return this.props.naturalnessNotes;
  }

  get suggestedCorrection(): string | undefined {
    return this.props.suggestedCorrection;
  }

  toJSON(): LanguageFeedbackJSON {
    return {
      overallScore: this.props.overallScore.valueOf(),
      grammarNotes: this.props.grammarNotes,
      naturalnessNotes: this.props.naturalnessNotes,
      suggestedCorrection: this.props.suggestedCorrection ?? null,
    };
  }
}
