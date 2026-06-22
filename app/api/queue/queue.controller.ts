import type { Request, Response } from "express";
import { createLogger } from "~/lib/logger";
import { QueueService } from "./queue.service";
import type { QueueStatus } from "./queue-entry.model";

const logger = createLogger("QueueController");

const VALID_STATUSES: QueueStatus[] = ["waiting", "in_progress", "seen"];

/** POST /api/queue/intake — public intake submission (no auth). */
export async function createIntake(req: Request, res: Response) {
  try {
    const { name, phone, email, reasonForVisit, preferredTime, medicalHistory } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return res.status(400).json({ success: false, message: "A contact phone number is required." });
    }
    if (!reasonForVisit || typeof reasonForVisit !== "string" || reasonForVisit.trim().length === 0) {
      return res.status(400).json({ success: false, message: "A reason for visit is required." });
    }

    const entry = await QueueService.createIntake({
      name,
      phone,
      email,
      reasonForVisit,
      preferredTime,
      medicalHistory,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: String((entry as any)._id),
        triageLevel: entry.triageLevel,
        lane: entry.lane,
        matchedLabels: entry.triageMatchedLabels,
        sms: entry.sms,
      },
    });
  } catch (error) {
    logger.error("Failed to create intake", error);
    return res.status(500).json({ success: false, message: "Failed to submit check-in." });
  }
}

/** GET /api/queue — live list of active entries (staff). */
export async function listQueue(_req: Request, res: Response) {
  try {
    const entries = await QueueService.listActive();
    return res.json({ success: true, data: entries });
  } catch (error) {
    logger.error("Failed to list queue", error);
    return res.status(500).json({ success: false, message: "Failed to load queue." });
  }
}

/** POST /api/queue/:id/advance — advance through waiting -> in_progress -> seen. */
export async function advanceEntry(req: Request, res: Response) {
  try {
    const entry = await QueueService.advanceStatus(String(req.params.id));
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found." });
    return res.json({ success: true, data: entry });
  } catch (error) {
    logger.error("Failed to advance entry", error);
    return res.status(500).json({ success: false, message: "Failed to update status." });
  }
}

/** POST /api/queue/:id/status — set an explicit status. */
export async function setEntryStatus(req: Request, res: Response) {
  try {
    const { status } = req.body ?? {};
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    const entry = await QueueService.setStatus(String(req.params.id), status);
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found." });
    return res.json({ success: true, data: entry });
  } catch (error) {
    logger.error("Failed to set status", error);
    return res.status(500).json({ success: false, message: "Failed to update status." });
  }
}

/** POST /api/queue/:id/clear — soft-clear a handled entry. */
export async function clearEntry(req: Request, res: Response) {
  try {
    const entry = await QueueService.clearEntry(String(req.params.id));
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found." });
    return res.json({ success: true, data: entry });
  } catch (error) {
    logger.error("Failed to clear entry", error);
    return res.status(500).json({ success: false, message: "Failed to clear entry." });
  }
}
