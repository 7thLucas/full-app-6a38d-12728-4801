import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/** Workflow status for a normal (routine) queue entry. */
export type QueueStatus = "waiting" | "in_progress" | "seen";

/** Triage lane: nurse-review (urgent) vs the normal waiting queue. */
export type QueueLane = "nurse_review" | "normal";

/** Record of the simulated/sent SMS confirmation, kept for auditability. */
export class SmsRecord {
  @prop({ type: String, required: true })
  status!: "sent" | "skipped" | "failed";

  @prop({ type: String, required: false })
  to?: string;

  @prop({ type: String, required: false })
  body?: string;

  @prop({ type: String, required: false })
  provider?: string;

  @prop({ type: Date, required: false })
  sentAt?: Date;

  @prop({ type: String, required: false })
  note?: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_queue_entries",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class QueueEntry extends CommonTypegooseEntity {
  // ── Patient details (from the intake form) ────────────────────────────────
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, required: true })
  phone!: string;

  @prop({ type: String, required: false })
  email?: string;

  @prop({ type: String, required: true })
  reasonForVisit!: string;

  @prop({ type: String, required: false })
  medicalHistory?: string;

  // ── Triage outcome (decided server-side by triage-policy) ─────────────────
  @prop({ type: String, required: true, enum: ["URGENT", "ROUTINE"] })
  triageLevel!: "URGENT" | "ROUTINE";

  @prop({ type: () => [String], default: [] })
  triageMatchedLabels!: string[];

  @prop({ type: () => [String], default: [] })
  triageMatchedRuleIds!: string[];

  // ── Routing / workflow ────────────────────────────────────────────────────
  @prop({ type: String, required: true, enum: ["nurse_review", "normal"] })
  lane!: QueueLane;

  @prop({ type: String, required: true, enum: ["waiting", "in_progress", "seen"], default: "waiting" })
  status!: QueueStatus;

  // ── SMS confirmation record ───────────────────────────────────────────────
  @prop({ type: () => SmsRecord, required: false, _id: false })
  sms?: SmsRecord;
}

export const QueueEntryModel = getModelForClass(QueueEntry);
