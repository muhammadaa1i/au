import { SpeechFeedbackEvaluator, SpeechFeedbackInput } from "@/domain/ports/SpeechFeedbackEvaluator";
import { LanguageFeedback } from "@/domain/value-objects/LanguageFeedback";
import { Score } from "@/domain/value-objects/Score";

export class FakeSpeechFeedbackEvaluator implements SpeechFeedbackEvaluator {
  public lastInput: SpeechFeedbackInput | null = null;

  constructor(private readonly feedback: LanguageFeedback = FakeSpeechFeedbackEvaluator.defaultFeedback()) {}

  static defaultFeedback(): LanguageFeedback {
    return LanguageFeedback.create({
      overallScore: Score.of(80),
      grammarNotes: [],
      naturalnessNotes: [],
    });
  }

  async evaluate(input: SpeechFeedbackInput): Promise<LanguageFeedback> {
    this.lastInput = input;
    return this.feedback;
  }
}
