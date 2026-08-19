import { InvalidUiLanguageError } from "@/domain/errors/DomainError";

export const UI_LANGUAGES = ["uz", "en", "ru"] as const;
export type UiLanguageValue = (typeof UI_LANGUAGES)[number];

export class UiLanguage {
  private constructor(private readonly value: UiLanguageValue) {}

  static of(value: string): UiLanguage {
    if (!UiLanguage.isValid(value)) {
      throw new InvalidUiLanguageError(value);
    }
    return new UiLanguage(value);
  }

  static isValid(value: string): value is UiLanguageValue {
    return (UI_LANGUAGES as readonly string[]).includes(value);
  }

  toString(): UiLanguageValue {
    return this.value;
  }

  equals(other: UiLanguage): boolean {
    return this.value === other.value;
  }
}
