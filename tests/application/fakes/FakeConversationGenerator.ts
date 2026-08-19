import {
  ConversationGenerator,
  ConversationTurnInput,
  ConversationTurnOutput,
} from "@/domain/ports/ConversationGenerator";

export class FakeConversationGenerator implements ConversationGenerator {
  public lastInput: ConversationTurnInput | null = null;

  constructor(private readonly reply: string = "かしこまりました。") {}

  async generateReply(input: ConversationTurnInput): Promise<ConversationTurnOutput> {
    this.lastInput = input;
    return { text: this.reply };
  }
}
