export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidJlptLevelError extends DomainError {
  constructor(value: string) {
    super(`"${value}" is not a valid JLPT level (expected one of N5, N4, N3, N2, N1)`);
  }
}

export class InvalidUiLanguageError extends DomainError {
  constructor(value: string) {
    super(`"${value}" is not a supported UI language (expected one of uz, en, ru)`);
  }
}

export class InvalidScoreError extends DomainError {
  constructor(value: number) {
    super(`${value} is not a valid score (expected an integer between 0 and 100)`);
  }
}

export class InvalidScenarioError extends DomainError {
  constructor(reason: string) {
    super(`Invalid scenario: ${reason}`);
  }
}

export class EmptyMessageTextError extends DomainError {
  constructor() {
    super("Message text must not be empty");
  }
}

export class FeedbackNotAllowedForTutorMessageError extends DomainError {
  constructor() {
    super("Language feedback can only be attached to a learner's message");
  }
}

export class SessionAlreadyCompletedError extends DomainError {
  constructor(sessionId: string) {
    super(`Conversation session "${sessionId}" is already completed`);
  }
}

export class InvalidEntityIdError extends DomainError {
  constructor(idType: string) {
    super(`${idType} value must not be empty`);
  }
}
