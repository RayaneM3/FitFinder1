import { eq, and, or, ilike, gte, lte, lt, desc, asc, ne, sql, notInArray, inArray } from "drizzle-orm";
import { db } from "./db";
import { broadcastToUser } from "./websocket";
import {
  users, profiles, trainerProfiles, clientProfiles,
  conversations, messages, blocks, reports,
  plans, orders, favorites, legalAcceptances, reviews,
  type User, type InsertUser, type Profile, type InsertProfile,
  type TrainerProfile, type InsertTrainerProfile,
  type ClientProfile, type InsertClientProfile,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Block, type InsertBlock,
  type Report, type InsertReport,
  type Plan, type InsertPlan,
  type Order, type InsertOrder,
  type Favorite, type InsertFavorite,
  type LegalAcceptance, type InsertLegalAcceptance,
  type Review, type InsertReview,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  upsertProfile(data: InsertProfile): Promise<Profile>;

  // Trainer Profiles
  getTrainerProfile(userId: string): Promise<TrainerProfile | undefined>;
  upsertTrainerProfile(data: InsertTrainerProfile): Promise<TrainerProfile>;

  // Client Profiles
  getClientProfile(userId: string): Promise<ClientProfile | undefined>;
  upsertClientProfile(data: InsertClientProfile): Promise<ClientProfile>;

  // Explore
  getTrainers(filters: {
    search?: string;
    city?: string;
    country?: string;
    coachingMode?: string;
    specialties?: string[];
    priceMin?: number;
    priceMax?: number;
    language?: string;
    sort?: string;
    page: number;
    pageSize: number;
  }): Promise<{ trainers: any[]; total: number }>;

  // Full trainer details
  getTrainerDetails(userId: string): Promise<any>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  findConversation(clientId: string, trainerId: string): Promise<Conversation | undefined>;
  createConversation(data: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<any[]>;
  updateConversationLastMessage(id: string): Promise<void>;

  // Messages
  getMessages(conversationId: string, limit?: number, before?: string): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  markMessagesRead(conversationId: string, userId: string): Promise<void>;

  // Blocks
  isBlocked(userId1: string, userId2: string): Promise<boolean>;
  createBlock(data: InsertBlock): Promise<Block>;
  removeBlock(blockerId: string, blockedId: string): Promise<void>;
  getBlockedUsers(userId: string): Promise<any[]>;

  // Reports
  createReport(data: InsertReport): Promise<Report>;

  // Plans
  getPlans(trainerId: string): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(data: InsertPlan): Promise<Plan>;
  updatePlan(id: string, data: Partial<Plan>): Promise<Plan | undefined>;

  // Orders
  createOrder(data: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByStripeSession(sessionId: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  getUserOrders(userId: string): Promise<any[]>;
  getTrainerOrders(trainerId: string): Promise<any[]>;
  hasActiveOrder(buyerId: string, trainerId: string): Promise<boolean>;

  // Favorites
  toggleFavorite(userId: string, trainerId: string): Promise<boolean>;
  getFavorites(userId: string): Promise<any[]>;
  isFavorited(userId: string, trainerId: string): Promise<boolean>;

  // Legal Acceptances
  createLegalAcceptance(data: InsertLegalAcceptance): Promise<LegalAcceptance>;
  getUserAcceptances(userId: string): Promise<LegalAcceptance[]>;
  hasAccepted(userId: string, documentType: string, version?: string): Promise<boolean>;

  // Stats
  getStats(): Promise<{ trainerCount: number; userCount: number }>;

  // Reviews
  createReview(data: InsertReview): Promise<Review>;
  getTrainerReviews(trainerId: string): Promise<{ reviews: any[]; averageRating: number; totalReviews: number }>;
  getReviewByOrder(orderId: string): Promise<Review | undefined>;
  getTrainerAverageRating(trainerId: string): Promise<{ avg: number; count: number }>;

  // Stripe Connect
  updateTrainerStripeAccount(userId: string, stripeAccountId: string): Promise<void>;
  updateOrderStripeSession(orderId: string, stripeSessionId: string): Promise<void>;
}

// Explicit column list for the users table — prevents newly-added sensitive columns
// (e.g. mfaSecret, backupCodes) from silently appearing in query results.
// passwordHash is included here because auth callers (bcrypt.compare) need it.
// Route handlers must NEVER send this result directly to res.json() — always use
// safeOwnUserResponse() or safeUserResponse() from server/utils/safe-user.ts.
const USER_COLUMNS = {
  id: users.id,
  email: users.email,
  passwordHash: users.passwordHash,
  name: users.name,
  image: users.image,
  role: users.role,
  onboardingComplete: users.onboardingComplete,
  isAdmin: users.isAdmin,
  bannedAt: users.bannedAt,
  failedLoginAttempts: users.failedLoginAttempts,
  lockedUntil: users.lockedUntil,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export class DatabaseStorage implements IStorage {
  // --- Users ---
  async getUser(id: string) {
    const [user] = await db.select(USER_COLUMNS).from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select(USER_COLUMNS).from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>) {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }

  // --- Profiles ---
  async getProfile(userId: string) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async upsertProfile(data: InsertProfile) {
    const [result] = await db
      .insert(profiles)
      .values(data)
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  // --- Trainer Profiles ---
  async getTrainerProfile(userId: string) {
    const [tp] = await db.select().from(trainerProfiles).where(eq(trainerProfiles.userId, userId));
    return tp;
  }

  async upsertTrainerProfile(data: InsertTrainerProfile) {
    const [result] = await db
      .insert(trainerProfiles)
      .values(data)
      .onConflictDoUpdate({
        target: trainerProfiles.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  // --- Client Profiles ---
  async getClientProfile(userId: string) {
    const [cp] = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, userId));
    return cp;
  }

  async upsertClientProfile(data: InsertClientProfile) {
    const [result] = await db
      .insert(clientProfiles)
      .values(data)
      .onConflictDoUpdate({
        target: clientProfiles.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  // --- Explore Trainers ---
  async getTrainers(filters: {
    search?: string;
    city?: string;
    country?: string;
    coachingMode?: string;
    specialties?: string[];
    priceMin?: number;
    priceMax?: number;
    language?: string;
    sort?: string;
    page: number;
    pageSize: number;
  }) {
    const conditions: any[] = [
      or(eq(users.role, "TRAINER"), eq(users.role, "BOTH")),
      eq(users.onboardingComplete, true),
    ];

    if (filters.search) {
      conditions.push(
        or(
          ilike(users.name, `%${filters.search}%`),
          ilike(profiles.city, `%${filters.search}%`),
          ilike(profiles.country, `%${filters.search}%`),
        )
      );
    }

    if (filters.city) {
      conditions.push(ilike(profiles.city, `%${filters.city}%`));
    }

    if (filters.country) {
      conditions.push(ilike(profiles.country, `%${filters.country}%`));
    }

    if (filters.coachingMode) {
      conditions.push(eq(profiles.coachingMode, filters.coachingMode as any));
    }

    if (filters.specialties && filters.specialties.length > 0) {
      // Safe: Drizzle's sql template literals auto-parameterize values, preventing SQL injection
      conditions.push(
        sql`${trainerProfiles.specialties} && ARRAY[${sql.join(filters.specialties.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    if (filters.priceMin !== undefined) {
      conditions.push(gte(trainerProfiles.priceMax, filters.priceMin));
    }

    if (filters.priceMax !== undefined) {
      conditions.push(lte(trainerProfiles.priceMin, filters.priceMax));
    }

    if (filters.language) {
      conditions.push(
        sql`${profiles.languages} @> ARRAY[${filters.language}]::text[]`
      );
    }

    const offset = (filters.page - 1) * filters.pageSize;

    let orderBy;
    switch (filters.sort) {
      case "price-low":
        orderBy = asc(trainerProfiles.priceMin);
        break;
      case "price-high":
        orderBy = desc(trainerProfiles.priceMax);
        break;
      case "newest":
        orderBy = desc(users.createdAt);
        break;
      default:
        orderBy = desc(users.createdAt);
    }

    const selectFields = {
      id: users.id,
      name: users.name,
      image: users.image,
      role: users.role,
      bio: profiles.bio,
      city: profiles.city,
      country: profiles.country,
      coachingMode: profiles.coachingMode,
      languages: profiles.languages,
      specialties: trainerProfiles.specialties,
      yearsExperience: trainerProfiles.yearsExperience,
      priceMin: trainerProfiles.priceMin,
      priceMax: trainerProfiles.priceMax,
      createdAt: users.createdAt,
      averageRating: sql<number>`COALESCE((SELECT avg(rating) FROM reviews WHERE trainer_id = ${users.id}), 0)`,
      reviewCount: sql<number>`(SELECT count(*)::int FROM reviews WHERE trainer_id = ${users.id})`,
      total: sql<number>`count(*) OVER()`,
    };

    const whereClause = and(...conditions);

    const results = await db
      .select(selectFields)
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .innerJoin(trainerProfiles, eq(users.id, trainerProfiles.userId))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(filters.pageSize)
      .offset(offset);

    const total = results.length > 0 ? Number(results[0].total) : 0;

    return {
      trainers: results.map(({ total: _, ...rest }) => rest),
      total,
    };
  }

  // --- Trainer Details ---
  async getTrainerDetails(userId: string) {
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        // email is intentionally excluded — not safe to expose on a public endpoint
        image: users.image,
        role: users.role,
        bio: profiles.bio,
        city: profiles.city,
        country: profiles.country,
        coachingMode: profiles.coachingMode,
        languages: profiles.languages,
        specialties: trainerProfiles.specialties,
        yearsExperience: trainerProfiles.yearsExperience,
        certifications: trainerProfiles.certifications,
        priceMin: trainerProfiles.priceMin,
        priceMax: trainerProfiles.priceMax,
        radiusKm: trainerProfiles.radiusKm,
        availabilityNotes: trainerProfiles.availabilityNotes,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(trainerProfiles, eq(users.id, trainerProfiles.userId))
      .where(eq(users.id, userId));

    return result;
  }

  // --- Conversations ---
  async getConversation(id: string) {
    const [convo] = await db.select().from(conversations).where(eq(conversations.id, id));
    return convo;
  }

  async findConversation(clientId: string, trainerId: string) {
    const [convo] = await db.select().from(conversations)
      .where(and(eq(conversations.clientId, clientId), eq(conversations.trainerId, trainerId)));
    return convo;
  }

  async createConversation(data: InsertConversation) {
    const [convo] = await db.insert(conversations).values(data).returning();
    return convo;
  }

  async getUserConversations(userId: string) {
    const results = await db.execute(sql`
      WITH blocked_ids AS (
        SELECT blocked_id AS uid FROM blocks WHERE blocker_id = ${userId}
        UNION
        SELECT blocker_id AS uid FROM blocks WHERE blocked_id = ${userId}
      ),
      last_msgs AS (
        SELECT DISTINCT ON (conversation_id)
          conversation_id, id, sender_id, content, created_at, read_at
        FROM messages
        ORDER BY conversation_id, created_at DESC
      ),
      unread_counts AS (
        SELECT conversation_id, count(*)::int AS unread_count
        FROM messages
        WHERE sender_id != ${userId} AND read_at IS NULL
        GROUP BY conversation_id
      )
      SELECT
        c.id, c.client_id, c.trainer_id, c.created_at, c.last_message_at,
        u.id AS other_user_id, u.name AS other_user_name, u.image AS other_user_image,
        lm.id AS last_msg_id, lm.sender_id AS last_msg_sender_id,
        LEFT(lm.content, 200) AS last_msg_content, lm.created_at AS last_msg_created_at,
        lm.read_at AS last_msg_read_at,
        COALESCE(uc.unread_count, 0) AS unread_count
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.client_id = ${userId} THEN c.trainer_id ELSE c.client_id END
      LEFT JOIN last_msgs lm ON lm.conversation_id = c.id
      LEFT JOIN unread_counts uc ON uc.conversation_id = c.id
      WHERE (c.client_id = ${userId} OR c.trainer_id = ${userId})
        AND NOT EXISTS (SELECT 1 FROM blocked_ids bi WHERE bi.uid = u.id)
      ORDER BY c.last_message_at DESC
    `);

    return results.rows.map((row: any) => ({
      id: row.id,
      clientId: row.client_id,
      trainerId: row.trainer_id,
      createdAt: row.created_at,
      lastMessageAt: row.last_message_at,
      otherUser: {
        id: row.other_user_id,
        name: row.other_user_name,
        image: row.other_user_image,
      },
      lastMessage: row.last_msg_id ? {
        id: row.last_msg_id,
        senderId: row.last_msg_sender_id,
        content: row.last_msg_content,
        createdAt: row.last_msg_created_at,
        readAt: row.last_msg_read_at,
      } : null,
      unreadCount: Number(row.unread_count),
    }));
  }

  async updateConversationLastMessage(id: string) {
    await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, id));
  }

  // --- Messages ---
  async getMessages(conversationId: string, limit = 50, before?: string) {
    const conditions: ReturnType<typeof eq>[] = [eq(messages.conversationId, conversationId)];
    if (before) {
      conditions.push(lt(messages.createdAt, new Date(before)));
    }
    const results = await db.select().from(messages)
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
    return results.reverse();
  }

  async createMessage(data: InsertMessage) {
    const [msg] = await db.insert(messages).values(data).returning();
    await this.updateConversationLastMessage(data.conversationId);

    // Broadcast via WebSocket to the other participant
    const convo = await this.getConversation(data.conversationId);
    if (convo) {
      const recipientId = convo.clientId === data.senderId ? convo.trainerId : convo.clientId;
      broadcastToUser(recipientId, {
        type: "new_message",
        conversationId: data.conversationId,
        message: msg,
      });
    }

    return msg;
  }

  async markMessagesRead(conversationId: string, userId: string) {
    await db.update(messages)
      .set({ readAt: new Date() })
      .where(and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderId, userId),
        sql`${messages.readAt} IS NULL`
      ));
  }

  // --- Blocks ---
  async isBlocked(userId1: string, userId2: string) {
    const result = await db.select().from(blocks)
      .where(or(
        and(eq(blocks.blockerId, userId1), eq(blocks.blockedId, userId2)),
        and(eq(blocks.blockerId, userId2), eq(blocks.blockedId, userId1)),
      ));
    return result.length > 0;
  }

  async createBlock(data: InsertBlock) {
    const [block] = await db.insert(blocks).values(data).returning();
    return block;
  }

  async removeBlock(blockerId: string, blockedId: string) {
    await db.delete(blocks).where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)));
  }

  async getBlockedUsers(userId: string) {
    const results = await db.select({
      id: blocks.id,
      blockedId: blocks.blockedId,
      createdAt: blocks.createdAt,
      name: users.name,
      image: users.image,
    }).from(blocks)
      .innerJoin(users, eq(blocks.blockedId, users.id))
      .where(eq(blocks.blockerId, userId));
    return results;
  }

  // --- Reports ---
  async createReport(data: InsertReport) {
    const [report] = await db.insert(reports).values(data).returning();
    return report;
  }

  // --- Plans ---
  async getPlans(trainerId: string) {
    return db.select().from(plans).where(eq(plans.trainerId, trainerId)).orderBy(desc(plans.createdAt));
  }

  async getPlan(id: string) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async createPlan(data: InsertPlan) {
    const [plan] = await db.insert(plans).values(data).returning();
    return plan;
  }

  async updatePlan(id: string, data: Partial<Plan>) {
    const [plan] = await db.update(plans).set({ ...data, updatedAt: new Date() }).where(eq(plans.id, id)).returning();
    return plan;
  }

  // --- Orders ---
  async createOrder(data: InsertOrder) {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async getOrder(id: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByStripeSession(sessionId: string) {
    const [order] = await db.select().from(orders).where(eq(orders.stripeCheckoutSessionId, sessionId));
    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    await db.update(orders).set({ status: status as any, updatedAt: new Date() }).where(eq(orders.id, id));
  }

  async getUserOrders(userId: string) {
    return db.select({
      id: orders.id,
      amountCents: orders.amountCents,
      currency: orders.currency,
      status: orders.status,
      createdAt: orders.createdAt,
      planTitle: plans.title,
      trainerName: users.name,
      hasReviewed: sql<boolean>`EXISTS(SELECT 1 FROM reviews WHERE order_id = ${orders.id})`,
    })
    .from(orders)
    .leftJoin(plans, eq(orders.planId, plans.id))
    .leftJoin(users, eq(orders.trainerId, users.id))
    .where(eq(orders.buyerId, userId))
    .orderBy(desc(orders.createdAt));
  }

  async getTrainerOrders(trainerId: string) {
    return db.select({
      id: orders.id,
      amountCents: orders.amountCents,
      currency: orders.currency,
      status: orders.status,
      createdAt: orders.createdAt,
      planTitle: plans.title,
      buyerName: users.name,
      buyerId: orders.buyerId,
    })
    .from(orders)
    .leftJoin(plans, eq(orders.planId, plans.id))
    .leftJoin(users, eq(orders.buyerId, users.id))
    .where(eq(orders.trainerId, trainerId))
    .orderBy(desc(orders.createdAt));
  }

  async hasActiveOrder(buyerId: string, trainerId: string) {
    const result = await db.select().from(orders)
      .where(and(eq(orders.buyerId, buyerId), eq(orders.trainerId, trainerId), eq(orders.status, "PAID")));
    return result.length > 0;
  }

  // --- Favorites ---
  async toggleFavorite(userId: string, trainerId: string) {
    // Use INSERT ... ON CONFLICT DO NOTHING to avoid race conditions.
    // If the row already existed, the insert returns nothing → we delete it.
    const inserted = await db
      .insert(favorites)
      .values({ userId, trainerId })
      .onConflictDoNothing()
      .returning();
    if (inserted.length > 0) {
      return true; // newly favorited
    }
    // Row already existed — remove it (unfavorite)
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.trainerId, trainerId)));
    return false;
  }

  async getFavorites(userId: string) {
    return db.select({
      id: favorites.id,
      trainerId: favorites.trainerId,
      createdAt: favorites.createdAt,
      name: users.name,
      image: users.image,
    }).from(favorites)
      .innerJoin(users, eq(favorites.trainerId, users.id))
      .where(eq(favorites.userId, userId));
  }

  async isFavorited(userId: string, trainerId: string) {
    const result = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.trainerId, trainerId)));
    return result.length > 0;
  }

  async createLegalAcceptance(data: InsertLegalAcceptance) {
    const [acceptance] = await db.insert(legalAcceptances).values(data).returning();
    return acceptance;
  }

  async getUserAcceptances(userId: string) {
    return db.select().from(legalAcceptances)
      .where(eq(legalAcceptances.userId, userId))
      .orderBy(desc(legalAcceptances.acceptedAt));
  }

  async hasAccepted(userId: string, documentType: string, version?: string) {
    const conditions = [
      eq(legalAcceptances.userId, userId),
      eq(legalAcceptances.documentType, documentType as any),
    ];
    if (version) {
      conditions.push(eq(legalAcceptances.version, version));
    }
    const result = await db.select().from(legalAcceptances).where(and(...conditions)).limit(1);
    return result.length > 0;
  }

  async getStats() {
    const trainerResult = await db.select({ count: sql<number>`count(*)::int` }).from(users)
      .where(or(eq(users.role, "TRAINER"), eq(users.role, "BOTH")));
    const userResult = await db.select({ count: sql<number>`count(*)::int` }).from(users)
      .where(eq(users.onboardingComplete, true));
    return {
      trainerCount: trainerResult[0]?.count ?? 0,
      userCount: userResult[0]?.count ?? 0,
    };
  }

  // --- Reviews ---
  async createReview(data: InsertReview) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async getTrainerReviews(trainerId: string) {
    const results = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      reviewerName: users.name,
      reviewerImage: users.image,
    })
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.trainerId, trainerId))
      .orderBy(desc(reviews.createdAt));

    const avgResult = await db.select({
      avg: sql<number>`COALESCE(avg(${reviews.rating}), 0)`,
      count: sql<number>`count(*)::int`,
    }).from(reviews).where(eq(reviews.trainerId, trainerId));

    return {
      reviews: results,
      averageRating: Number(Number(avgResult[0]?.avg || 0).toFixed(1)),
      totalReviews: Number(avgResult[0]?.count || 0),
    };
  }

  async getReviewByOrder(orderId: string) {
    const [review] = await db.select().from(reviews).where(eq(reviews.orderId, orderId));
    return review;
  }

  async getTrainerAverageRating(trainerId: string) {
    const result = await db.select({
      avg: sql<number>`COALESCE(avg(${reviews.rating}), 0)`,
      count: sql<number>`count(*)::int`,
    }).from(reviews).where(eq(reviews.trainerId, trainerId));
    return {
      avg: Number(Number(result[0]?.avg || 0).toFixed(1)),
      count: Number(result[0]?.count || 0),
    };
  }

  async updateTrainerStripeAccount(userId: string, stripeAccountId: string): Promise<void> {
    await db.update(trainerProfiles)
      .set({ stripeAccountId, stripeAccountConnected: true, updatedAt: new Date() })
      .where(eq(trainerProfiles.userId, userId));
  }

  async updateOrderStripeSession(orderId: string, stripeSessionId: string): Promise<void> {
    await db.update(orders)
      .set({ stripeCheckoutSessionId: stripeSessionId, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }
}

export const storage = new DatabaseStorage();
