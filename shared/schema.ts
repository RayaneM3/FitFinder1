import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, uniqueIndex, index, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["CLIENT", "TRAINER", "BOTH"]);
export const coachingModeEnum = pgEnum("coaching_mode", ["ONLINE", "IN_PERSON", "HYBRID"]);
export const experienceLevelEnum = pgEnum("experience_level", ["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export const reportCategoryEnum = pgEnum("report_category", ["HARASSMENT", "SPAM", "INAPPROPRIATE", "SCAM", "OTHER"]);
export const reportStatusEnum = pgEnum("report_status", ["OPEN", "REVIEWING", "CLOSED"]);
export const billingTypeEnum = pgEnum("billing_type", ["ONE_TIME", "MONTHLY"]);
export const orderStatusEnum = pgEnum("order_status", ["PENDING", "PAID", "CANCELED"]);
export const documentTypeEnum = pgEnum("document_type", ["TERMS", "PRIVACY", "TRAINER_AGREEMENT", "CLIENT_WAIVER", "COMMUNITY_GUIDELINES", "REFUNDS"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull().default(""),
  image: text("image"),
  role: roleEnum("role"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  bannedAt: timestamp("banned_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("users_role_idx").on(table.role),
  index("users_onboarding_idx").on(table.onboardingComplete),
]);

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  bio: text("bio").default(""),
  city: text("city").default(""),
  country: text("country").default(""),
  languages: text("languages").array().default(sql`'{}'::text[]`),
  coachingMode: coachingModeEnum("coaching_mode").default("ONLINE"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("profiles_city_idx").on(table.city),
  index("profiles_country_idx").on(table.country),
]);

export const trainerProfiles = pgTable("trainer_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  specialties: text("specialties").array().default(sql`'{}'::text[]`),
  yearsExperience: integer("years_experience").default(0),
  certifications: text("certifications").array().default(sql`'{}'::text[]`),
  priceMin: integer("price_min").default(0),
  priceMax: integer("price_max").default(0),
  radiusKm: integer("radius_km").default(50),
  availabilityNotes: text("availability_notes").default(""),
  stripeAccountId: text("stripe_account_id"),
  stripeAccountConnected: boolean("stripe_account_connected").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const clientProfiles = pgTable("client_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  goals: text("goals").array().default(sql`'{}'::text[]`),
  experienceLevel: experienceLevelEnum("experience_level").default("BEGINNER"),
  budgetMin: integer("budget_min").default(0),
  budgetMax: integer("budget_max").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  trainerId: varchar("trainer_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("conversation_client_trainer_idx").on(table.clientId, table.trainerId),
]);

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
}, (table) => [
  index("message_conversation_created_idx").on(table.conversationId, table.createdAt),
]);

export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull().references(() => users.id),
  blockedId: varchar("blocked_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("block_unique_idx").on(table.blockerId, table.blockedId),
]);

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedId: varchar("reported_id").notNull().references(() => users.id),
  category: reportCategoryEnum("category").notNull(),
  details: text("details").default(""),
  status: reportStatusEnum("status").notNull().default("OPEN"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainerId: varchar("trainer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").default(""),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  billingType: billingTypeEnum("billing_type").notNull().default("ONE_TIME"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  trainerId: varchar("trainer_id").notNull().references(() => users.id),
  planId: varchar("plan_id").references(() => plans.id),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("orders_buyer_idx").on(table.buyerId),
  index("orders_trainer_idx").on(table.trainerId),
  index("orders_status_idx").on(table.status),
]);

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  trainerId: varchar("trainer_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("favorite_unique_idx").on(table.userId, table.trainerId),
  index("favorites_user_idx").on(table.userId),
]);

export const legalAcceptances = pgTable("legal_acceptances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentType: documentTypeEnum("document_type").notNull(),
  version: text("version").notNull(),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
}, (table) => [
  index("legal_acceptance_user_idx").on(table.userId, table.documentType),
]);

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  trainerId: varchar("trainer_id").notNull().references(() => users.id),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  rating: integer("rating").notNull(),
  comment: text("comment").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("review_order_idx").on(table.orderId),
  index("review_trainer_idx").on(table.trainerId),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Insert Schemas ---
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrainerProfileSchema = createInsertSchema(trainerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, lastMessageAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, readAt: true });
export const insertBlockSchema = createInsertSchema(blocks).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, status: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true, updatedAt: true, isActive: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertLegalAcceptanceSchema = createInsertSchema(legalAcceptances).omit({ id: true, acceptedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// --- Types ---
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type InsertTrainerProfile = z.infer<typeof insertTrainerProfileSchema>;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type LegalAcceptance = typeof legalAcceptances.$inferSelect;
export type InsertLegalAcceptance = z.infer<typeof insertLegalAcceptanceSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// --- Validation Schemas for API ---
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const onboardingStep1Schema = z.object({
  role: z.enum(["CLIENT", "TRAINER", "BOTH"]),
});

export const onboardingStep2Schema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  city: z.string().min(1),
  country: z.string().min(1),
  languages: z.array(z.string()).min(1),
  coachingMode: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]),
});

export const onboardingTrainerSchema = z.object({
  specialties: z.array(z.string()).min(1),
  yearsExperience: z.number().min(0),
  certifications: z.array(z.string()),
  priceMin: z.number().min(0),
  priceMax: z.number().min(0),
  radiusKm: z.number().min(0).optional(),
  availabilityNotes: z.string().optional(),
});

export const onboardingClientSchema = z.object({
  goals: z.array(z.string()).min(1),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
});

export const createReviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const exploreFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  coachingMode: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
  specialties: z.array(z.string()).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  language: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(12),
  sort: z.enum(["recommended", "price-low", "price-high", "newest"]).optional(),
});
