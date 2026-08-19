import { CreateScenario } from "@/application/use-cases/admin/CreateScenario";
import { DeleteScenario } from "@/application/use-cases/admin/DeleteScenario";
import { SetScenarioPublished } from "@/application/use-cases/admin/SetScenarioPublished";
import { UpdateScenario } from "@/application/use-cases/admin/UpdateScenario";
import { GetLearningHistory } from "@/application/use-cases/history/GetLearningHistory";
import { EndConversationSession } from "@/application/use-cases/practice/EndConversationSession";
import { GetSessionDetail } from "@/application/use-cases/practice/GetSessionDetail";
import { SendUserMessage } from "@/application/use-cases/practice/SendUserMessage";
import { StartConversationSession } from "@/application/use-cases/practice/StartConversationSession";
import { EnsureLearnerProfile } from "@/application/use-cases/profile/EnsureLearnerProfile";
import { UpdateLearnerProfile } from "@/application/use-cases/profile/UpdateLearnerProfile";
import { GetScenario } from "@/application/use-cases/scenarios/GetScenario";
import { ListScenarios } from "@/application/use-cases/scenarios/ListScenarios";
import { GeminiConversationGenerator } from "@/infrastructure/ai/gemini/GeminiConversationGenerator";
import { GeminiSpeechFeedbackEvaluator } from "@/infrastructure/ai/gemini/GeminiSpeechFeedbackEvaluator";
import { CryptoIdGenerator } from "@/infrastructure/ids/CryptoIdGenerator";
import { PrismaScenarioRepository } from "@/infrastructure/persistence/prisma/PrismaScenarioRepository";
import { PrismaSessionRepository } from "@/infrastructure/persistence/prisma/PrismaSessionRepository";
import { PrismaUserProfileRepository } from "@/infrastructure/persistence/prisma/PrismaUserProfileRepository";

// Composition root: the only place that wires domain ports to their concrete
// (Prisma/Gemini) adapters. Presentation code (server actions, route
// handlers) should depend on `container`, never construct adapters directly.

const scenarioRepository = new PrismaScenarioRepository();
const sessionRepository = new PrismaSessionRepository();
const userProfileRepository = new PrismaUserProfileRepository();
const idGenerator = new CryptoIdGenerator();
const conversationGenerator = new GeminiConversationGenerator();
const speechFeedbackEvaluator = new GeminiSpeechFeedbackEvaluator();

export const container = {
  /** Exposed for read-only lookups in presentation-layer guards (e.g. requireLearnerProfile). */
  profiles: userProfileRepository,

  listScenarios: new ListScenarios(scenarioRepository),
  getScenario: new GetScenario(scenarioRepository),

  createScenario: new CreateScenario(scenarioRepository, idGenerator),
  updateScenario: new UpdateScenario(scenarioRepository),
  setScenarioPublished: new SetScenarioPublished(scenarioRepository),
  deleteScenario: new DeleteScenario(scenarioRepository),

  startConversationSession: new StartConversationSession(sessionRepository, scenarioRepository, idGenerator),
  sendUserMessage: new SendUserMessage(
    sessionRepository,
    userProfileRepository,
    idGenerator,
    conversationGenerator,
    speechFeedbackEvaluator,
  ),
  endConversationSession: new EndConversationSession(sessionRepository),
  getSessionDetail: new GetSessionDetail(sessionRepository),

  getLearningHistory: new GetLearningHistory(sessionRepository),

  ensureLearnerProfile: new EnsureLearnerProfile(userProfileRepository, idGenerator),
  updateLearnerProfile: new UpdateLearnerProfile(userProfileRepository),
} as const;
