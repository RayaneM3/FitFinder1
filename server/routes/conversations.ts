import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware";
import { sendEmail, newMessageEmail } from "../email";

const router = Router();

router.post("/api/conversations", requireAuth, async (req, res) => {
  try {
    const { trainerId } = req.body;
    const userId = req.session.userId!;

    if (trainerId === userId) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    const user = await storage.getUser(userId);
    if (!user || (user.role !== "CLIENT" && user.role !== "BOTH")) {
      return res.status(403).json({ message: "Only clients can initiate conversations" });
    }

    const blocked = await storage.isBlocked(userId, trainerId);
    if (blocked) return res.status(403).json({ message: "Cannot message this user" });

    let convo = await storage.findConversation(userId, trainerId);
    if (!convo) {
      convo = await storage.createConversation({ clientId: userId, trainerId });
    }

    return res.json(convo);
  } catch (e) {
    console.error("[POST /api/conversations]:", e);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
});

router.get("/api/conversations", requireAuth, async (req, res) => {
  try {
    const convos = await storage.getUserConversations(req.session.userId!);
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
    const userId = req.session.userId!;
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

    const userId = req.session.userId!;
    if (convo.clientId !== userId && convo.trainerId !== userId) {
      return res.status(403).json({ message: "Not a participant" });
    }

    await storage.markMessagesRead(conversationId as string, userId);
    const msgs = await storage.getMessages(conversationId as string);
    return res.json(msgs);
  } catch (e) {
    console.error("[GET /api/messages]:", e);
    return res.status(500).json({ message: "Failed to load messages" });
  }
});

router.post("/api/messages", requireAuth, async (req, res) => {
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

    const userId = req.session.userId!;
    if (convo.clientId !== userId && convo.trainerId !== userId) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const otherUserId = convo.clientId === userId ? convo.trainerId : convo.clientId;
    const blocked = await storage.isBlocked(userId, otherUserId);
    if (blocked) return res.status(403).json({ message: "Cannot message this user" });

    const msg = await storage.createMessage({
      conversationId,
      senderId: userId,
      content: content.trim(),
    });

    // Send email notification for first message in conversation (fire-and-forget)
    const allMsgs = await storage.getMessages(conversationId, 2);
    if (allMsgs.length <= 1) {
      const trainerUser = await storage.getUser(convo.trainerId);
      const senderUser = await storage.getUser(userId);
      if (trainerUser?.email && senderUser) {
        const appUrl = process.env.APP_URL || `https://${req.headers.host}`;
        const { subject, html } = newMessageEmail(
          trainerUser.name, senderUser.name, content.trim(),
          `${appUrl}/messages/${conversationId}`
        );
        sendEmail(trainerUser.email, subject, html);
      }
    }

    return res.json(msg);
  } catch (e) {
    console.error("[POST /api/messages]:", e);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

router.post("/api/block", requireAuth, async (req, res) => {
  try {
    const { blockedId } = req.body;
    if (!blockedId) return res.status(400).json({ message: "blockedId required" });
    await storage.createBlock({ blockerId: req.session.userId!, blockedId });
    return res.json({ success: true });
  } catch (e) {
    console.error("[POST /api/block]:", e);
    return res.status(500).json({ message: "Failed to block user" });
  }
});

router.delete("/api/block/:blockedId", requireAuth, async (req, res) => {
  try {
    await storage.removeBlock(req.session.userId!, req.params.blockedId as string);
    return res.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/block/:blockedId]:", e);
    return res.status(500).json({ message: "Failed to unblock user" });
  }
});

router.get("/api/blocked", requireAuth, async (req, res) => {
  try {
    const blockedUsers = await storage.getBlockedUsers(req.session.userId!);
    return res.json(blockedUsers);
  } catch (e) {
    console.error("[GET /api/blocked]:", e);
    return res.status(500).json({ message: "Failed to load blocked users" });
  }
});

router.post("/api/report", requireAuth, async (req, res) => {
  try {
    const { reportedId, category, details } = req.body;
    const VALID_CATEGORIES = ["HARASSMENT", "SPAM", "INAPPROPRIATE", "SCAM", "OTHER"];
    if (!reportedId || !category) return res.status(400).json({ message: "reportedId and category required" });
    if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ message: "Invalid category" });
    if (reportedId === req.session.userId) return res.status(400).json({ message: "Cannot report yourself" });
    await storage.createReport({
      reporterId: req.session.userId!,
      reportedId,
      category: category as any,
      details: typeof details === "string" ? details.slice(0, 1000) : "",
    });
    return res.json({ success: true });
  } catch (e) {
    console.error("[POST /api/report]:", e);
    return res.status(500).json({ message: "Failed to submit report" });
  }
});

export default router;
