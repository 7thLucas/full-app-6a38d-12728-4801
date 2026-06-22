import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import {
  fetchQueue,
  advanceEntry,
  clearEntry,
  type QueueEntryDTO,
  type QueueStatus,
} from "~/lib/queue.client";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Live queue — Clearway" }];
}

const STATUS_META: Record<
  QueueStatus,
  { label: string; dot: string; pill: string }
> = {
  waiting: {
    label: "Waiting",
    dot: "bg-muted-foreground",
    pill: "bg-secondary text-secondary-foreground",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-primary",
    pill: "bg-primary/15 text-primary",
  },
  seen: {
    label: "Seen",
    dot: "bg-chart-2",
    pill: "bg-chart-2/15 text-chart-2",
  },
};

export default function QueuePage() {
  const { config } = useConfigurables();
  const [entries, setEntries] = useState<QueueEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const initialLoad = useRef(true);

  const clinicName = config?.clinicName || config?.appName || "Clearway Clinic";
  const queueCfg = config?.queue;
  const refreshMs = Math.max(2, queueCfg?.refreshSeconds ?? 5) * 1000;

  const load = useCallback(async () => {
    const res = await fetchQueue();
    if (res.success && res.data) {
      setEntries(res.data);
      setError(null);
      setLastUpdated(new Date());
    } else if (initialLoad.current) {
      setError(res.message || "Failed to load the queue.");
    }
    initialLoad.current = false;
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, refreshMs);
    return () => clearInterval(timer);
  }, [load, refreshMs]);

  async function handleAdvance(id: string) {
    setBusyId(id);
    await advanceEntry(id);
    await load();
    setBusyId(null);
  }

  async function handleClear(id: string) {
    setBusyId(id);
    await clearEntry(id);
    await load();
    setBusyId(null);
  }

  const { urgent, normal } = useMemo(() => {
    const urgent = entries.filter((e) => e.lane === "nurse_review");
    const normal = entries.filter((e) => e.lane === "normal");
    return { urgent, normal };
  }, [entries]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-navbar/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-foreground">
                {queueCfg?.heading || "Live patient queue"}
              </p>
              <p className="text-xs text-muted-foreground">{clinicName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <RefreshCw className="h-3 w-3" aria-hidden />
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Live"}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Intake
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
            Loading queue…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── NURSE REVIEW (URGENT) — always first, visually dominant ── */}
            <section aria-label="Nurse review">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
                <h2 className="text-base font-semibold text-destructive">
                  {queueCfg?.nurseReviewLabel || "Nurse review — urgent"}
                </h2>
                <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                  {urgent.length}
                </span>
              </div>

              {urgent.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
                  No urgent patients. Red-flag intakes (e.g. chest pain) appear
                  here ahead of the waiting queue.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {urgent.map((entry) => (
                    <PatientCard
                      key={entry._id}
                      entry={entry}
                      urgent
                      busy={busyId === entry._id}
                      onAdvance={() => handleAdvance(entry._id)}
                      onClear={() => handleClear(entry._id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── NORMAL WAITING QUEUE ── */}
            <section aria-label="Waiting queue">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="text-base font-semibold text-foreground">
                  {queueCfg?.normalQueueLabel || "Waiting queue"}
                </h2>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {normal.length}
                </span>
              </div>

              {normal.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
                  No one is waiting right now.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {normal.map((entry) => (
                    <PatientCard
                      key={entry._id}
                      entry={entry}
                      busy={busyId === entry._id}
                      onAdvance={() => handleAdvance(entry._id)}
                      onClear={() => handleClear(entry._id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function PatientCard({
  entry,
  urgent,
  busy,
  onAdvance,
  onClear,
}: {
  entry: QueueEntryDTO;
  urgent?: boolean;
  busy: boolean;
  onAdvance: () => void;
  onClear: () => void;
}) {
  const status = STATUS_META[entry.status];
  const waitMins = Math.max(
    0,
    Math.round((Date.now() - new Date(entry.createdAt).getTime()) / 60000),
  );

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-card p-4 shadow-sm",
        urgent ? "border-destructive/40 ring-1 ring-destructive/20" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-foreground">
            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {entry.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.phone}</p>
        </div>
        {urgent ? (
          <span className="shrink-0 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-destructive-foreground">
            Urgent
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              status.pill,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-foreground/90">
        {entry.reasonForVisit}
      </p>

      {urgent && entry.triageMatchedLabels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.triageMatchedLabels.map((label) => (
            <span
              key={label}
              className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {entry.medicalHistory ? (
        <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
          History: {entry.medicalHistory}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" aria-hidden />
        Waiting {waitMins} min
      </div>

      <div className="mt-4 flex items-center gap-2">
        {entry.status !== "seen" ? (
          <button
            onClick={onAdvance}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <>
                {entry.status === "waiting" ? "Start" : "Mark seen"}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onClear}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden />
                Clear
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
