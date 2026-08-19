import { describe, expect, it } from "vitest";
import { UiLanguage } from "@/domain/value-objects/UiLanguage";
import { InvalidUiLanguageError } from "@/domain/errors/DomainError";

describe("UiLanguage", () => {
  it("accepts uz, en and ru", () => {
    for (const lang of ["uz", "en", "ru"]) {
      expect(UiLanguage.of(lang).toString()).toBe(lang);
    }
  });

  it("throws InvalidUiLanguageError for an unsupported language", () => {
    expect(() => UiLanguage.of("fr")).toThrow(InvalidUiLanguageError);
  });
});
