import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { evaluateTriage } from "~/lib/triage-policy";
import { submitIntake, type IntakeResult } from "~/lib/queue.client";
import { cn } from "~/lib/utils";

interface FormState {
  name: string;
  phone: string;
  email: string;
  reasonForVisit: string;
  medicalHistory: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  reasonForVisit: "",
  medicalHistory: "",
};

export function meta() {
  return [
    { title: "Patient check-in — Clearway" },
    { name: "description", content: "Quick, private patient check-in." },
  ];
}

export default function IntakePage() {
  const { config, loading } = useConfigurables();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IntakeResult | null>(null);

  const clinicName = config?.clinicName || config?.appName || "Clearway Clinic";
  const intake = config?.intake;

  // Live, client-side preview of the triage decision (same policy as server).
  const liveTriage = useMemo(
    () => evaluateTriage(form.reasonForVisit),
    [form.reasonForVisit],
  );

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim() || !form.reasonForVisit.trim()) {
      setError("Please fill in your name, phone number, and reason for visit.");
      return;
    }

    setSubmitting(true);
    const res = await submitIntake({
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      reasonForVisit: form.reasonForVisit,
      medicalHistory: form.medicalHistory || undefined,
    });
    setSubmitting(false);

    if (!res.success || !res.data) {
      setError(res.message || "Something went wrong. Please tell the front desk.");
      return;
    }
    setResult(res.data);
  }

  if (result) {
    return (
      <ConfirmationView
        result={result}
        clinicName={clinicName}
        title={intake?.confirmationTitle || "You're checked in"}
        message={
          intake?.confirmationMessage ||
          "Thanks — your intake has been received."
        }
        urgentNotice={
          intake?.urgentNotice ||
          "A nurse will see you as a priority. Please alert the front desk if you feel worse."
        }
        onReset={() => {
          setForm(EMPTY_FORM);
          setResult(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header clinicName={clinicName} tagline={config?.tagline} loading={loading} />

      <main className="mx-auto w-full max-w-xl px-5 pb-16 pt-6 sm:pt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {intake?.heading || "Patient check-in"}
          </h1>
          {intake?.subheading ? (
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {intake.subheading}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <Field
            label="Full name"
            required
            htmlFor="name"
          >
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Jordan Avery"
              className={inputClass}
            />
          </Field>

          <Field
            label="Mobile phone (for SMS)"
            required
            htmlFor="phone"
            hint="We'll text you a confirmation."
          >
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="e.g. (555) 012-3456"
              className={inputClass}
            />
          </Field>

          <Field label="Email (optional)" htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>

          <Field
            label="Reason for visit"
            required
            htmlFor="reason"
            hint="Briefly describe your symptoms or why you're here."
          >
            <textarea
              id="reason"
              rows={3}
              value={form.reasonForVisit}
              onChange={(e) => update("reasonForVisit", e.target.value)}
              placeholder="e.g. sore throat and a fever since yesterday"
              className={cn(inputClass, "resize-none")}
            />
            {liveTriage.isUrgent ? (
              <div
                role="status"
                className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  This looks like it may need urgent attention. You'll be routed
                  straight to a nurse — and if this is an emergency, call your
                  local emergency number now.
                </span>
              </div>
            ) : null}
          </Field>

          <Field
            label="Basic medical history (optional)"
            htmlFor="history"
            hint="Allergies, current medications, conditions."
          >
            <textarea
              id="history"
              rows={3}
              value={form.medicalHistory}
              onChange={(e) => update("medicalHistory", e.target.value)}
              placeholder="e.g. asthma; takes albuterol; allergic to penicillin"
              className={cn(inputClass, "resize-none")}
            />
          </Field>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              <>{intake?.submitLabel || "Submit check-in"}</>
            )}
          </button>

          {intake?.privacyNote ? (
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              {intake.privacyNote}
            </p>
          ) : null}
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/queue"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Staff queue
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </main>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

function Field({
  label,
  required,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Header({
  clinicName,
  tagline,
  loading,
}: {
  clinicName: string;
  tagline?: string;
  loading: boolean;
}) {
  return (
    <header className="border-b border-border bg-navbar">
      <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Stethoscope className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight text-foreground">
            {loading ? "…" : clinicName}
          </p>
          {tagline ? (
            <p className="truncate text-xs text-muted-foreground">{tagline}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function ConfirmationView({
  result,
  clinicName,
  title,
  message,
  urgentNotice,
  onReset,
}: {
  result: IntakeResult;
  clinicName: string;
  title: string;
  message: string;
  urgentNotice: string;
  onReset: () => void;
}) {
  const isUrgent = result.triageLevel === "URGENT";
  return (
    <div className="min-h-screen bg-background">
      <Header clinicName={clinicName} loading={false} />
      <main className="mx-auto w-full max-w-xl px-5 pb-16 pt-12">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          {isUrgent ? (
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-7 w-7" aria-hidden />
            </span>
          ) : (
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </span>
          )}

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            {message}
          </p>

          {isUrgent ? (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-left">
              <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Priority: nurse review
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-destructive/90">
                {urgentNotice}
              </p>
            </div>
          ) : null}

          {result.sms?.status === "sent" ? (
            <p className="mt-5 text-xs text-muted-foreground">
              A confirmation text has been sent to your phone
              {result.sms.provider === "simulated" ? " (demo mode)" : ""}.
            </p>
          ) : null}

          <button
            onClick={onReset}
            className="mt-6 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Check in another patient
          </button>
        </div>
      </main>
    </div>
  );
}
