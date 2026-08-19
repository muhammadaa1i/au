import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { container } from "@/di/container";

export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return new NextResponse("Webhook verification failed", { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, first_name, last_name, username } = event.data;
    const displayName = [first_name, last_name].filter(Boolean).join(" ") || username || "Learner";

    await container.ensureLearnerProfile.execute({
      clerkUserId: id,
      displayName,
    });
  }

  return NextResponse.json({ received: true });
}
