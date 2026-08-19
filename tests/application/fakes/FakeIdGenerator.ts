import { IdGenerator } from "@/domain/ports/IdGenerator";

export class FakeIdGenerator implements IdGenerator {
  private counter = 0;

  generate(): string {
    this.counter += 1;
    return `fake-id-${this.counter}`;
  }
}
