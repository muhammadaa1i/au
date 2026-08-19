export abstract class ApplicationError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message);
  }
}

export class SessionNotActiveError extends ApplicationError {
  constructor(sessionId: string) {
    super(`Conversation session "${sessionId}" is not active`);
  }
}
