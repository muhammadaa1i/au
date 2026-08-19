import { LearnerProfileId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";
import { UiLanguage } from "@/domain/value-objects/UiLanguage";

export type LearnerRoleValue = "learner" | "admin";

export interface LearnerProfileProps {
  id: LearnerProfileId;
  clerkUserId: string;
  displayName: string;
  uiLanguage: UiLanguage;
  jlptLevel: JlptLevel;
  role: LearnerRoleValue;
  createdAt: Date;
  updatedAt: Date;
}

export class LearnerProfile {
  private constructor(private props: LearnerProfileProps) {}

  static createDefault(props: {
    id: LearnerProfileId;
    clerkUserId: string;
    displayName: string;
    uiLanguage?: UiLanguage;
  }): LearnerProfile {
    const now = new Date();
    return new LearnerProfile({
      id: props.id,
      clerkUserId: props.clerkUserId,
      displayName: props.displayName,
      uiLanguage: props.uiLanguage ?? UiLanguage.of("uz"),
      jlptLevel: JlptLevel.of("N5"),
      role: "learner",
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: LearnerProfileProps): LearnerProfile {
    return new LearnerProfile(props);
  }

  updateJlptLevel(level: JlptLevel): void {
    this.props.jlptLevel = level;
    this.props.updatedAt = new Date();
  }

  updateUiLanguage(language: UiLanguage): void {
    this.props.uiLanguage = language;
    this.props.updatedAt = new Date();
  }

  updateDisplayName(displayName: string): void {
    const trimmed = displayName.trim();
    if (!trimmed) {
      throw new Error("displayName must not be empty");
    }
    this.props.displayName = trimmed;
    this.props.updatedAt = new Date();
  }

  get id(): LearnerProfileId {
    return this.props.id;
  }

  get clerkUserId(): string {
    return this.props.clerkUserId;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get uiLanguage(): UiLanguage {
    return this.props.uiLanguage;
  }

  get jlptLevel(): JlptLevel {
    return this.props.jlptLevel;
  }

  get role(): LearnerRoleValue {
    return this.props.role;
  }

  get isAdmin(): boolean {
    return this.props.role === "admin";
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
