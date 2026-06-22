import { apiRequest } from "~/lib/api.client";

export type QueueStatus = "waiting" | "in_progress" | "seen";
export type QueueLane = "nurse_review" | "normal";

export interface QueueEntryDTO {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  reasonForVisit: string;
  medicalHistory?: string;
  triageLevel: "URGENT" | "ROUTINE";
  triageMatchedLabels: string[];
  triageMatchedRuleIds: string[];
  lane: QueueLane;
  status: QueueStatus;
  sms?: {
    status: "sent" | "skipped" | "failed";
    to?: string;
    body?: string;
    provider?: string;
    sentAt?: string;
    note?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IntakePayload {
  name: string;
  phone: string;
  email?: string;
  reasonForVisit: string;
  medicalHistory?: string;
}

export interface IntakeResult {
  id: string;
  triageLevel: "URGENT" | "ROUTINE";
  lane: QueueLane;
  matchedLabels: string[];
  sms?: QueueEntryDTO["sms"];
}

export async function submitIntake(payload: IntakePayload) {
  return apiRequest<IntakeResult>("/api/queue/intake", {
    method: "POST",
    data: payload,
  });
}

export async function fetchQueue() {
  return apiRequest<QueueEntryDTO[]>("/api/queue", { method: "GET" });
}

export async function advanceEntry(id: string) {
  return apiRequest<QueueEntryDTO>(`/api/queue/${id}/advance`, { method: "POST" });
}

export async function clearEntry(id: string) {
  return apiRequest<QueueEntryDTO>(`/api/queue/${id}/clear`, { method: "POST" });
}
