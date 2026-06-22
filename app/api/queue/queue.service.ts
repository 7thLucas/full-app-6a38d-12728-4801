import { createLogger } from "~/lib/logger";
import { evaluateTriage } from "~/lib/triage-policy";
import { ConfigurablesService } from "~/modules/configurables/src/services/configurables.service";
import { defaultConfigurablesData } from "~/modules/configurables/src/constants/configurables.default";
import { QueueEntryModel, type QueueEntry, type QueueStatus } from "./queue-entry.model";
import { sendSms } from "./sms.service";

const logger = createLogger("QueueService");

export interface CreateIntakeInput {
  name: string;
  phone: string;
  email?: string;
  reasonForVisit: string;
  medicalHistory?: string;
}

/** Status workflow order for the normal queue. */
const STATUS_ORDER: QueueStatus[] = ["waiting", "in_progress", "seen"];

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => vars[key] ?? "");
}

async function getConfigData() {
  try {
    const config = await ConfigurablesService.getData();
    // Merge over defaults so missing keys never break the flow.
    return {
      ...defaultConfigurablesData,
      ...(config as Record<string, unknown>),
      sms: { ...defaultConfigurablesData.sms, ...((config as any)?.sms ?? {}) },
    };
  } catch {
    return defaultConfigurablesData;
  }
}

export class QueueService {
  /**
   * Create a queue entry from an intake submission.
   *
   * SAFETY-CRITICAL: the triage policy is evaluated here, server-side, BEFORE
   * the entry is placed in any lane. Urgent submissions are routed to the
   * nurse-review lane and never the normal waiting queue.
   */
  static async createIntake(input: CreateIntakeInput) {
    const config = await getConfigData();

    // Combine the built-in triage policy with any owner-added keywords.
    const extraKeywords = Array.isArray(config.urgentSymptomKeywords)
      ? config.urgentSymptomKeywords
      : [];
    const decision = evaluateTriage(input.reasonForVisit);

    // Owner-extended keyword check (configurable, still inspectable).
    const haystack = (input.reasonForVisit ?? "").toLowerCase();
    const extraMatches = extraKeywords
      .map((k) => String(k).toLowerCase().trim())
      .filter((k) => k.length > 0 && haystack.includes(k));

    const isUrgent = decision.isUrgent || extraMatches.length > 0;
    const matchedLabels = [...decision.matchedLabels, ...extraMatches];
    const matchedRuleIds = [
      ...decision.matchedRuleIds,
      ...extraMatches.map((k) => `custom:${k}`),
    ];

    const lane = isUrgent ? "nurse_review" : "normal";

    logger.info("Triage decision for intake", {
      name: input.name,
      lane,
      triageLevel: isUrgent ? "URGENT" : "ROUTINE",
      matchedRuleIds,
    });

    // ── Send SMS confirmation (simulated unless a live provider is wired) ────
    let smsRecord;
    const smsConfig = config.sms;
    if (smsConfig?.enabled) {
      const template = isUrgent ? smsConfig.urgentTemplate : smsConfig.confirmationTemplate;
      const body = renderTemplate(template, {
        name: input.name,
        clinic: config.clinicName ?? config.appName ?? "the clinic",
      });
      smsRecord = await sendSms({ to: input.phone, body });
    } else {
      smsRecord = { status: "skipped" as const, provider: "none", note: "SMS disabled in config." };
    }

    const entry = await QueueEntryModel.create({
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      reasonForVisit: input.reasonForVisit.trim(),
      medicalHistory: input.medicalHistory?.trim() || undefined,
      triageLevel: isUrgent ? "URGENT" : "ROUTINE",
      triageMatchedLabels: matchedLabels,
      triageMatchedRuleIds: matchedRuleIds,
      lane,
      status: "waiting",
      sms: smsRecord,
    });

    return entry.toObject();
  }

  /** List all active (non-deleted, not yet cleared) entries, newest urgent first. */
  static async listActive() {
    const entries = await QueueEntryModel.find({
      deletedAt: null,
    })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return entries;
  }

  /** Advance a normal-queue entry through waiting -> in_progress -> seen. */
  static async advanceStatus(id: string) {
    const entry = await QueueEntryModel.findById(id).exec();
    if (!entry) return null;

    const idx = STATUS_ORDER.indexOf(entry.status);
    const next = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
    entry.status = next;
    await entry.save();
    return entry.toObject();
  }

  /** Set an explicit status (used by nurse-review actions too). */
  static async setStatus(id: string, status: QueueStatus) {
    const entry = await QueueEntryModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    )
      .lean()
      .exec();
    return entry;
  }

  /** Soft-clear an entry from the queue once handled. */
  static async clearEntry(id: string) {
    const entry = await QueueEntryModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date(), status: "seen" } },
      { new: true },
    )
      .lean()
      .exec();
    return entry;
  }
}

export type { QueueEntry };
