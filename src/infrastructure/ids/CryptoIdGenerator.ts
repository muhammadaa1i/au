import { randomUUID } from "node:crypto";
import { IdGenerator } from "@/domain/ports/IdGenerator";

export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
