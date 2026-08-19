import { InvalidEntityIdError } from "@/domain/errors/DomainError";

export abstract class EntityId {
  protected constructor(readonly value: string) {
    if (!value.trim()) {
      throw new InvalidEntityIdError(new.target.name);
    }
  }

  equals(other: EntityId): boolean {
    return this.constructor === other.constructor && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
