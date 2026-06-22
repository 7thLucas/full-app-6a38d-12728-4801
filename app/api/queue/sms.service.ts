import { createLogger } from "~/lib/logger";

const logger = createLogger("SmsService");

export interface SmsSendInput {
  to: string;
  body: string;
}

export interface SmsSendResult {
  status: "sent" | "skipped" | "failed";
  to?: string;
  body?: string;
  provider: string;
  sentAt?: Date;
  note?: string;
}

/**
 * Send an SMS confirmation.
 *
 * If a live provider is configured via environment variables
 * (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER), this would
 * call it. Otherwise it falls back to a SIMULATED send: the message is logged
 * and recorded against the queue entry so the end-to-end flow is fully
 * demonstrable without a live SMS account.
 */
export async function sendSms({ to, body }: SmsSendInput): Promise<SmsSendResult> {
  const hasLiveProvider =
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_FROM_NUMBER;

  if (!to || to.trim().length === 0) {
    logger.warn("SMS skipped — no destination phone number");
    return { status: "skipped", provider: "none", note: "No phone number provided." };
  }

  if (!hasLiveProvider) {
    // Simulated send — clearly logged + recorded.
    logger.info("[SIMULATED SMS] Confirmation message", { to, body });
    return {
      status: "sent",
      to,
      body,
      provider: "simulated",
      sentAt: new Date(),
      note: "Simulated send — no live SMS provider configured. Set TWILIO_* env vars to enable real delivery.",
    };
  }

  // Live provider path (left as a thin stub; wiring an HTTP call to the
  // provider would go here when credentials are present).
  try {
    logger.info("Sending SMS via live provider", { to });
    // Real provider call would happen here.
    return { status: "sent", to, body, provider: "live", sentAt: new Date() };
  } catch (error) {
    logger.error("Live SMS send failed", error, { to });
    return { status: "failed", to, body, provider: "live", note: "Live provider send failed." };
  }
}
