/** Fields safe to expose for ANY user (e.g. trainer card, conversation participant) */
export function safeUserResponse(user: any) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    image: user.image,
    onboardingComplete: user.onboardingComplete,
    // NEVER include: email, passwordHash, bannedAt, isAdmin, createdAt
  };
}

/** Fields safe to expose for the currently-logged-in user only */
export function safeOwnUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
    onboardingComplete: user.onboardingComplete,
    isAdmin: user.isAdmin,
    emailVerified: user.emailVerified,
    // NEVER include: passwordHash, bannedAt
  };
}
