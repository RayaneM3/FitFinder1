import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireEmailVerified } from "../middleware";
import { sendEmail, newMessageEmail } from "../email";
import { isUserOnline } from "../websocket";
import { sanitizeString } from "../utils/sanitize";
import { z } from "zod";

const createConversationSchema = z.object({
  trainerId: z.string().min(1),
});

const createBlockSchema = z.object({
  blockedId: z.string().min(1),
});

const createReportSchema = z.object({
  reportedId: z.string().min(1),
  category: z.enum(["HARASSMENT", "SPAM", "INAPPROPRIATE", "SCAM", "OTHER"]),
  details: z.string().max(2000).optional(),
});

// Per-conversation email cooldown: don't spam more than once per 10 min
const lastEmailSent = new Map<string, number>(); // key: `${userId}:${conversationId}`
const EMAIL_COOLDOWN_MS = 10 * 60 * 1000;

const router = Router();

router.post("/api/conversations", requireAuth, requireEmailVerified, async (req, res) => {
  try {
    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "trainerId is required" });
    }
    const { trainerId } = parsed.data;
    const user = req.user!;

    if (trainerId === user.id) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    if (user.role !== "CLIENT" && user.role !== "BOTH") {
      return res.status(403).json({ message: "Only clients can initiate conversations" });
    }

    const trainer = await storage.getUser(trainerId);
    if (!trainer || !trainer.onboardingComplete || (trainer.role !== "TRAINER" && trainer.role !== "BOTH")) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const blocked = await storage.isBlocked(user.id, trainerId);
    if (blocked) return res.status(403).json({ message: "Cannot message this user" });

    let convo = await storage.findConversation(user.id, trainerId);
    if (!convo) {
      convo = await storage.createConversation({ clientId: user.id, trainerId });
    }

    return res.json(convo);
  } catch (e) {
    console.error("[POST /api/conversations]:", e);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
});

router.get("/api/conversations", requireAuth, async (req, res) => {
  try {
    const convos = await storage.getUserConversations(req.user!.id);
    return res.json(convos);
  } catch (e) {
    console.error("[GET /api/conversations]:", e);
    return res.status(500).json({ message: "Failed to load conversations" });
  }
});

router.post("/api/conversations/:id/read", requireAuth, async (req, res) => {
  try {
    const convoId = req.params.id as string;
    const convo = await storage.getConversation(convoId);
    if (!convo) return res.status(404).json({ message: "Not found" });
    const userId = req.user!.id;
    if (convo.clientId !== userId && convo.trainerId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await storage.markMessagesRead(convoId, userId);
    return res.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/conversations/:id/read]:", e);
    return res.status(500).json({ message: "Failed to mark conversation as read" });
  }
});

router.get("/api/messages", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId) return res.status(400).json({ message: "conversationId required" });

    const convo = await storage.getConversation(conversationId as string);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    const userId = req.user!.id;
    if (convo.clientId !== userId && convo.trainerId !== userId) {
      return res.status(403).json({ message: "Not a participant" });
    }

    await storage.markMessagesRead(conversationId as string, userId);
    const before = req.query.before as string | undefined;
    const msgs = await storage.getMessages(conversationId as string, 50, before);
    return res.json(msgs);
  } catch (e) {
    console.error("[GET /api/messages]:", e);
    return res.status(500).json({ message: "Failed to load messages" });
  }
});

router.post("/api/messages", requireAuth, requireEmailVerified, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    if (!conversationId || !content?.trim()) {
      return res.status(400).json({ message: "conversationId and content required" });
    }
    if (content.trim().length > 5000) {
      return res.status(400).json({ message: "Message too long (max 5000 characters)" });
    }

    const convo = await storage.getConversation(conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    const userId = req.user!.id;
    if (convo.clientId !== userId && convo.trainerId !== userId) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const otherUserId = convo.clientId === userId ? convo.trainerId : convo.clientId;
    const blocked = await storage.isBlocked(userId, otherUserId);
    if (blocked) return res.status(403).json({ message: "Cannot message this user" });

    const cleanContent = sanitizeString(content.trim());
    const msg = await storage.createMessage({
      conversationId,
      senderId: userId,
      content: cleanContent,
    });

    // Notify recipient via email if offline and cooldown has passed (fire-and-forget)
    const cooldownKey = `${otherUserId}:${conversationId}`;
    const lastSent = lastEmailSent.get(cooldownKey) ?? 0;
    if (!isUserOnline(otherUserId) && Date.now() - lastSent > EMAIL_COOLDOWN_MS) {
      lastEmailSent.set(cooldownKey, Date.now());
      storage.getUser(otherUserId).then((recipientUser) => {
        if (recipientUser?.email) {
          const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || `https://${req.headers.host}`;
          const { subject, html } = newMessageEmail(
            recipientUser.name, req.user!.name, cleanContent,
            `${appUrl}/messages/${conversationId}`
          );
          sendEmail(recipientUser.email, subject, html);
        }
      }).catch(() => {});
    }

    return res.json(msg);
  } catch (e) {
    console.error("[POST /api/messages]:", e);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

router.post("/api/block", requireAuth, async (req, res) => {
  try {
    const parsed = createBlockSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "blockedId is required" });
    }
    const { blockedId } = parsed.data;
    if (blockedId === req.user!.id) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }
    await storage.createBlock({ blockerId: req.user!.id, blockedId });
    return res.json({ success: true });
  } catch (e) {
    console.error("[POST /api/block]:", e);
    return res.status(500).json({ message: "Failed to block user" });
  }
});

router.delete("/api/block/:blockedId", requireAuth, async (req, res) => {
  try {
    await storage.removeBlock(req.user!.id, req.params.blockedId as string);
    return res.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/block/:blockedId]:", e);
    return res.status(500).json({ message: "Failed to unblock user" });
  }
});

router.get("/api/blocked", requireAuth, async (req, res) => {
  try {
    const blockedUsers = await storage.getBlockedUsers(req.user!.id);
    return res.json(blockedUsers);
  } catch (e) {
    console.error("[GET /api/blocked]:", e);
    return res.status(500).json({ message: "Failed to load blocked users" });
  }
});

router.post("/api/report", requireAuth, async (req, res) => {
  try {
    const parsed = createReportSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid report data" });
    }
    const { reportedId, category, details } = parsed.data;
    if (reportedId === req.user!.id) return res.status(400).json({ message: "Cannot report yourself" });
    await storage.createReport({
      reporterId: req.user!.id,
      reportedId,
      category: category as any,
      details: details ?? "",
    });
    return res.json({ success: true });
  } catch (e) {
    console.error("[POST /api/report]:", e);
    return res.status(500).json({ message: "Failed to submit report" });
  }
});

export default router;
