// Temporary until Phase 3 (auth). Every debate needs a userId; for now we attach
// all debates to a single seeded "demo" user. Phase 3 replaces this with the
// authenticated user's id from the JWT.
import { prisma } from "./prisma";

export async function getDemoUserId(): Promise<string> {
  const email = "demo@local";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: "demo" },
  });
  return user.id;
}
