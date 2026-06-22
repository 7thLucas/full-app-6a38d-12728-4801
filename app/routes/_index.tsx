import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ClipboardCheck,
  MessageSquareText,
  Clock3,
  Phone,
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
  preferredTime: string;
  medicalHistory: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  reasonForVisit: "",
  preferredTime: "",
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

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.reasonForVisit.trim() ||
      !form.preferredTime.trim()
    ) {
      setError(
        "Please fill in your name, phone number, reason for visit, and preferred time.",
      );
      return;
    }

    setSubmitting(true);
    const res = await submitIntake({
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      reasonForVisit: form.reasonForVisit,
      preferredTime: form.preferredTime,
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
        tagline={config?.tagline}
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
      <AppBar clinicName={clinicName} tagline={config?.tagline} loading={loading} />

      <main className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-8 sm:py-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
        {/* ── Reassurance rail (left on desktop, top on mobile) ── */}
        <aside className="lg:pt-1">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-balance text-foreground sm:text-[1.75rem]">
            {intake?.heading || "Patient check-in"}
          </h1>
          {intake?.subheading ? (
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-pretty text-muted-foreground">
              {intake.subheading}
            </p>
          ) : null}

          <ol className="mt-7 space-y-5">
            <Step
              icon={ClipboardCheck}
              title="Tell us about your visit"
              body="A few quick details — about a minute, no account needed."
            />
            <Step
              icon={MessageSquareText}
              title="Get an SMS confirmation"
              body="We text you as soon as we've received your check-in."
            />
            <Step
              icon={Clock3}
              title="Take a seat"
              body="Staff see you on the live queue and call you when ready."
            />
          </ol>
        </aside>

        {/* ── Form ── */}
        <section className="cw-rise">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-foreground/[0.03] sm:p-7"
          >
            <Field label="Full name" required htmlFor="name">
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
              label="Mobile phone"
              required
              htmlFor="phone"
              hint="We'll text your confirmation here."
            >
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="(555) 012-3456"
                  className={cn(inputClass, "pl-10")}
                />
              </div>
            </Field>

            <Field label="Email" htmlFor="email" hint="Optional.">
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
                aria-describedby={liveTriage.isUrgent ? "urgent-note" : undefined}
              />
              {liveTriage.isUrgent ? (
                <div
                  id="urgent-note"
                  role="status"
                  className="cw-slide-in mt-2.5 flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/[0.07] px-3.5 py-3 text-sm leading-relaxed text-destructive"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    This may need urgent attention — you'll be routed straight to
                    a nurse. If this is an emergency, call your local emergency
                    number now.
                  </span>
                </div>
              ) : null}
            </Field>

            <Field
              label="Preferred appointment time"
              required
              htmlFor="preferredTime"
              hint="When would you like to be seen? We'll do our best to match it."
            >
              <input
                id="preferredTime"
                type="text"
                value={form.preferredTime}
                onChange={(e) => update("preferredTime", e.target.value)}
                placeholder="e.g. this afternoon, or tomorrow morning"
                className={inputClass}
              />
            </Field>

            <Field
              label="Basic medical history"
              htmlFor="history"
              hint="Optional — allergies, current medications, conditions."
            >
              <textarea
                id="history"
                rows={2}
                value={form.medicalHistory}
                onChange={(e) => update("medicalHistory", e.target.value)}
                placeholder="e.g. asthma; takes albuterol; allergic to penicillin"
                className={cn(inputClass, "resize-none")}
              />
            </Field>

            {error ? (
              <p
                role="alert"
                className="cw-slide-in flex items-start gap-2 rounded-xl bg-destructive/[0.07] px-3.5 py-3 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                <>
                  {intake?.submitLabel || "Submit check-in"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>

            {intake?.privacyNote ? (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden
                />
                {intake.privacyNote}
              </p>
            ) : null}
          </form>

          <div className="mt-6 text-center lg:text-right">
            <Link
              to="/queue"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Staff queue
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

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
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          ) : null}
        </label>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ClipboardCheck;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}

function AppBar({
  clinicName,
  tagline,
  loading,
}: {
  clinicName: string;
  tagline?: string;
  loading: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-navbar/85 backdrop-blur supports-[backdrop-filter]:bg-navbar/75">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-5 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
          <Stethoscope className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
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
  tagline,
  title,
  message,
  urgentNotice,
  onReset,
}: {
  result: IntakeResult;
  clinicName: string;
  tagline?: string;
  title: string;
  message: string;
  urgentNotice: string;
  onReset: () => void;
}) {
  const isUrgent = result.triageLevel === "URGENT";
  return (
    <div className="min-h-screen bg-background">
      <AppBar clinicName={clinicName} tagline={tagline} loading={false} />
      <main className="mx-auto flex w-full max-w-xl flex-col px-5 py-12 sm:py-16">
        <div className="cw-rise rounded-2xl border border-border bg-card p-7 text-center shadow-sm shadow-foreground/[0.03] sm:p-9">
          {isUrgent ? (
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
              <AlertTriangle className="h-8 w-8" aria-hidden />
            </span>
          ) : (
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <CheckCircle2 className="h-8 w-8" aria-hidden />
            </span>
          )}

          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground">
            {title}
          </h1>
          <p className="mx-auto mt-2.5 max-w-prose text-[15px] leading-relaxed text-pretty text-muted-foreground">
            {message}
          </p>

          {isUrgent ? (
            <div className="mt-6 rounded-xl border border-destructive/25 bg-destructive/[0.07] p-4 text-left">
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
            <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <MessageSquareText className="h-3.5 w-3.5" aria-hidden />
              Confirmation text sent
              {result.sms.provider === "simulated" ? " · demo mode" : ""}
            </p>
          ) : null}

          <button
            onClick={onReset}
            className="mt-7 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Check in another patient
          </button>
        </div>
      </main>
    </div>
  );
}
