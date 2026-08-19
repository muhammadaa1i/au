import { InvalidScenarioError } from "@/domain/errors/DomainError";
import { LearnerProfileId, ScenarioId } from "@/domain/value-objects/ids";
import { JlptLevel } from "@/domain/value-objects/JlptLevel";

export interface ScenarioProps {
  id: ScenarioId;
  title: string;
  description: string;
  category: string;
  jlptLevel: JlptLevel;
  systemPrompt: string;
  openingLine: string;
  isPublished: boolean;
  createdById: LearnerProfileId;
  createdAt: Date;
  updatedAt: Date;
}

export type ScenarioContent = Pick<
  ScenarioProps,
  "title" | "description" | "category" | "jlptLevel" | "systemPrompt" | "openingLine"
>;

export class Scenario {
  private constructor(private props: ScenarioProps) {}

  static create(
    content: ScenarioContent & { id: ScenarioId; createdById: LearnerProfileId },
  ): Scenario {
    Scenario.validateContent(content);
    const now = new Date();
    return new Scenario({
      ...content,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ScenarioProps): Scenario {
    return new Scenario(props);
  }

  private static validateContent(content: ScenarioContent): void {
    if (!content.title.trim()) throw new InvalidScenarioError("title must not be empty");
    if (!content.description.trim()) throw new InvalidScenarioError("description must not be empty");
    if (!content.category.trim()) throw new InvalidScenarioError("category must not be empty");
    if (!content.systemPrompt.trim()) throw new InvalidScenarioError("systemPrompt must not be empty");
    if (!content.openingLine.trim()) throw new InvalidScenarioError("openingLine must not be empty");
  }

  updateContent(content: ScenarioContent): void {
    Scenario.validateContent(content);
    this.props = { ...this.props, ...content, updatedAt: new Date() };
  }

  publish(): void {
    this.props.isPublished = true;
    this.props.updatedAt = new Date();
  }

  unpublish(): void {
    this.props.isPublished = false;
    this.props.updatedAt = new Date();
  }

  get id(): ScenarioId {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get jlptLevel(): JlptLevel {
    return this.props.jlptLevel;
  }

  get systemPrompt(): string {
    return this.props.systemPrompt;
  }

  get openingLine(): string {
    return this.props.openingLine;
  }

  get isPublished(): boolean {
    return this.props.isPublished;
  }

  get createdById(): LearnerProfileId {
    return this.props.createdById;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
