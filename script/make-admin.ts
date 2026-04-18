import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];
if (!email) {
  console.log("Usage: npx tsx script/make-admin.ts your@email.com");
  process.exit(1);
}

const [user] = await db
  .update(users)
  .set({ isAdmin: true })
  .where(eq(users.email, email))
  .returning();

if (user) {
  console.log(`✓ ${user.name} (${user.email}) is now an admin.`);
} else {
  console.log(`✗ No user found with email: ${email}`);
}
process.exit(0);
