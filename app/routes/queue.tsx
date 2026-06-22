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
  { label: string; dot: string; pill: string; nextLabel: string }
> = {
  waiting: {
    label: "Waiting",
    dot: "bg-muted-foreground",
    pill: "bg-secondary text-secondary-foreground",
    nextLabel: "Start",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-primary",
    pill: "bg-primary/12 text-primary",
    nextLabel: "Mark seen",
  },
  seen: {
    label: "Seen",
    dot: "bg-chart-2",
    pill: "bg-chart-2/15 text-chart-2",
    nextLabel: "",
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

  const { urgent, normal, inProgress } = useMemo(() => {
    const urgent = entries.filter((e) => e.lane === "nurse_review");
    const normal = entries.filter((e) => e.lane === "normal");
    const inProgress = entries.filter((e) => e.status === "in_progress").length;
    return { urgent, normal, inProgress };
  }, [entries]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-navbar/85 backdrop-blur supports-[backdrop-filter]:bg-navbar/75">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">
                {queueCfg?.heading || "Live patient queue"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {clinicName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <span
                className="cw-live-dot h-1.5 w-1.5 rounded-full bg-chart-2"
                aria-hidden
              />
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Live"}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Intake
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-6">
        {/* ── Summary toolbar ── */}
        {!loading && !error ? (
          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Stat
              label="Urgent"
              value={urgent.length}
              tone={urgent.length > 0 ? "urgent" : "muted"}
            />
            <Stat label="Waiting" value={normal.length} tone="default" />
            <Stat label="In progress" value={inProgress} tone="primary" />
          </div>
        ) : null}

        {loading ? (
          <SkeletonQueue />
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/25 bg-destructive/[0.07] p-4 text-sm text-destructive"
          >
            {error}
          </div>
        ) : (
          <div className="space-y-9">
            {/* ── NURSE REVIEW (URGENT) — dominant, always first ── */}
            <section aria-label="Nurse review">
              <SectionHeader
                icon={AlertTriangle}
                title={queueCfg?.nurseReviewLabel || "Nurse review — urgent"}
                count={urgent.length}
                tone="urgent"
              />

              {urgent.length === 0 ? (
                <EmptyState>
                  No urgent patients. Red-flag intakes (e.g. chest pain) surface
                  here ahead of the waiting queue.
                </EmptyState>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {urgent.map((entry) => (
                    <UrgentCard
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

            {/* ── NORMAL WAITING QUEUE — dense, scannable list ── */}
            <section aria-label="Waiting queue">
              <SectionHeader
                icon={Activity}
                title={queueCfg?.normalQueueLabel || "Waiting queue"}
                count={normal.length}
                tone="default"
              />

              {normal.length === 0 ? (
                <EmptyState>No one is waiting right now.</EmptyState>
              ) : (
                <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-foreground/[0.03]">
                  {normal.map((entry, i) => (
                    <QueueRow
                      key={entry._id}
                      entry={entry}
                      first={i === 0}
                      busy={busyId === entry._id}
                      onAdvance={() => handleAdvance(entry._id)}
                      onClear={() => handleClear(entry._id)}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "urgent" | "primary" | "default" | "muted";
}) {
  const valueTone =
    tone === "urgent"
      ? "text-destructive"
      : tone === "primary"
        ? "text-primary"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={cn("text-xl font-semibold tabular-nums", valueTone)}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  tone,
}: {
  icon: typeof Activity;
  title: string;
  count: number;
  tone: "urgent" | "default";
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon
        className={cn(
          "h-[18px] w-[18px]",
          tone === "urgent" ? "text-destructive" : "text-primary",
        )}
        aria-hidden
      />
      <h2
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          tone === "urgent" ? "text-destructive" : "text-foreground",
        )}
      >
        {title}
      </h2>
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
          tone === "urgent"
            ? "bg-destructive text-destructive-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        {count}
      </span>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-7 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function waitMinutes(createdAt: string) {
  return Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));
}

/** Urgent entries get prominent, alert-accented cards (visual priority). */
function UrgentCard({
  entry,
  busy,
  onAdvance,
  onClear,
}: {
  entry: QueueEntryDTO;
  busy: boolean;
  onAdvance: () => void;
  onClear: () => void;
}) {
  const status = STATUS_META[entry.status];
  return (
    <article className="cw-rise flex flex-col rounded-xl border border-destructive/35 bg-card p-4 shadow-sm shadow-destructive/10 ring-1 ring-destructive/15">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-foreground">
            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {entry.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {entry.phone}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-destructive-foreground">
          Urgent
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/90">
        {entry.reasonForVisit}
      </p>

      {entry.triageMatchedLabels.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
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

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          Waiting {waitMinutes(entry.createdAt)} min
        </span>
        {entry.preferredTime ? <span>Prefers: {entry.preferredTime}</span> : null}
        <StatusPill status={entry.status} />
      </div>

      <ActionRow
        status={entry.status}
        busy={busy}
        onAdvance={onAdvance}
        onClear={onClear}
        primaryLabel={status.nextLabel || "Mark seen"}
        urgent
      />
    </article>
  );
}

/** Normal-queue entries render as a dense, scannable list row. */
function QueueRow({
  entry,
  first,
  busy,
  onAdvance,
  onClear,
}: {
  entry: QueueEntryDTO;
  first: boolean;
  busy: boolean;
  onAdvance: () => void;
  onClear: () => void;
}) {
  const status = STATUS_META[entry.status];
  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-secondary/40 sm:flex-row sm:items-center sm:gap-4",
        !first && "border-t border-border",
      )}
    >
      {/* status dot */}
      <span
        className={cn("hidden h-2 w-2 shrink-0 rounded-full sm:block", status.dot)}
        aria-hidden
      />

      {/* identity + reason */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {entry.name}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {entry.phone}
          </span>
          <span className="sm:hidden">
            <StatusPill status={entry.status} />
          </span>
        </div>
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
          {entry.reasonForVisit}
          {entry.preferredTime ? (
            <span className="text-muted-foreground/70">
              {" · prefers "}
              {entry.preferredTime}
            </span>
          ) : null}
        </p>
      </div>

      {/* meta + action */}
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden />
          {waitMinutes(entry.createdAt)} min
        </span>
        <span className="hidden sm:block">
          <StatusPill status={entry.status} />
        </span>
        <RowAction
          status={entry.status}
          busy={busy}
          onAdvance={onAdvance}
          onClear={onClear}
          primaryLabel={status.nextLabel || "Mark seen"}
        />
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: QueueStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors duration-150",
        meta.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

/** Compact inline action for list rows. */
function RowAction({
  status,
  busy,
  onAdvance,
  onClear,
  primaryLabel,
}: {
  status: QueueStatus;
  busy: boolean;
  onAdvance: () => void;
  onClear: () => void;
  primaryLabel: string;
}) {
  if (status === "seen") {
    return (
      <button
        onClick={onClear}
        disabled={busy}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
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
    );
  }
  return (
    <button
      onClick={onAdvance}
      disabled={busy}
      className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <>
          {primaryLabel}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </>
      )}
    </button>
  );
}

/** Full-width action row for urgent cards. */
function ActionRow({
  status,
  busy,
  onAdvance,
  onClear,
  primaryLabel,
  urgent,
}: {
  status: QueueStatus;
  busy: boolean;
  onAdvance: () => void;
  onClear: () => void;
  primaryLabel: string;
  urgent?: boolean;
}) {
  return (
    <div className="mt-4 flex items-center gap-2">
      {status !== "seen" ? (
        <button
          onClick={onAdvance}
          disabled={busy}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-[background-color,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card disabled:opacity-60",
            urgent
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <>
              {status === "waiting" ? "Start review" : primaryLabel}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onClear}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
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
  );
}

function SkeletonQueue() {
  return (
    <div className="space-y-9">
      <section>
        <div className="mb-3 h-5 w-44 rounded cw-skeleton" />
        <div className="grid gap-3 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-36 rounded-xl border border-border bg-card p-4"
            >
              <div className="h-4 w-32 rounded cw-skeleton" />
              <div className="mt-3 h-3 w-full rounded cw-skeleton" />
              <div className="mt-2 h-3 w-2/3 rounded cw-skeleton" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-3 h-5 w-36 rounded cw-skeleton" />
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-4 px-4 py-4",
                i > 0 && "border-t border-border",
              )}
            >
              <div className="h-2 w-2 rounded-full cw-skeleton" />
              <div className="flex-1">
                <div className="h-3.5 w-40 rounded cw-skeleton" />
                <div className="mt-2 h-3 w-64 rounded cw-skeleton" />
              </div>
              <div className="h-7 w-20 rounded-lg cw-skeleton" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
