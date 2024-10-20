
import { Webhook } from "svix";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { handleUserCreated } from "./functions";
import { env } from "~/env";


export async function POST(req: Request) {
  const payload = await req.text();

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response(undefined, { status: 400 });
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error: unknown) {
    const err = error as Error;
    console.log("Error verifying webhook:", err.message);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 400 },
    );
  }

  switch (event.type) {
    case "user.created":
      return await handleUserCreated(event);
    default:
      console.log(`Unhandled event type: ${event.type}`);
      return new Response(undefined, { status: 200 });
  }
}
