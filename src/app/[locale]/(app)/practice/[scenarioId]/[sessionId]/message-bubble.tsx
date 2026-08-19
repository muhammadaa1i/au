import { Badge } from "@/components/ui/badge";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { MessageDTO } from "../../message-dto";

export function MessageBubble({ message, dictionary }: { message: MessageDTO; dictionary: Dictionary }) {
  const isLearner = message.role === "learner";

  return (
    <div className={`flex flex-col gap-1 ${isLearner ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isLearner ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {message.text}
      </div>

      {message.feedback && (
        <div className="flex max-w-[80%] flex-col gap-1.5 rounded-lg border bg-card p-3 text-xs text-muted-foreground">
          <Badge variant="secondary" className="w-fit">
            {dictionary.practice.score}: {message.feedback.overallScore}
          </Badge>

          {message.feedback.grammarNotes.length > 0 && (
            <div>
              <p className="font-medium text-foreground">{dictionary.practice.grammarNotes}</p>
              <ul className="list-disc pl-4">
                {message.feedback.grammarNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {message.feedback.naturalnessNotes.length > 0 && (
            <div>
              <p className="font-medium text-foreground">{dictionary.practice.naturalnessNotes}</p>
              <ul className="list-disc pl-4">
                {message.feedback.naturalnessNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {message.feedback.suggestedCorrection && (
            <p>
              <span className="font-medium text-foreground">{dictionary.practice.suggestedCorrection}: </span>
              {message.feedback.suggestedCorrection}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
