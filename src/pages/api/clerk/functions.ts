import { type UserJSON } from "@clerk/clerk-sdk-node";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { userRepository } from "~/server/api/repositories";
import { User } from "~/server/api/models/user"

export const handleUserCreated = async (event: WebhookEvent) => {
  const {
    first_name: firstName,
    last_name: lastName,
    email_addresses,
    id: clerkId,
  } = event.data as UserJSON;
  const email = email_addresses[0]?.email_address;

  if (!email) return new Response(undefined, { status: 400 });

  const existingUser = await userRepository.findOneByUserIdOrNull(clerkId);

  if (existingUser) return new Response(undefined, { status: 200 });

  const currentDate = new Date();
  const newUser = new User({
    id: clerkId,
    email,
    firstName,
    lastName,
    isDarkMode: false,
    isNotificationsEnabled: false,
    homeCarParkId: null,
    workCarParkId: null,
    createdAt: currentDate,
    deletedAt: currentDate,
    updatedAt: currentDate
  });


  await userRepository.save(newUser);

  return new Response(undefined, { status: 200 });
};
