# Product Overview — Clearway

> Single source of truth for the product. Facts here drive the creative blueprint and the app.
> Items marked _(assumption)_ are not yet confirmed by the user and should be validated during onboarding.

## What it is

**Clearway** is a patient intake dashboard for a small clinic. Patients self-complete an intake form
before or on arrival; clinic staff watch a live queue of who has checked in and where
each patient is in the flow; patients receive an SMS confirmation when their intake is
received. The product removes the front-desk clipboard and the manual phone-call
reminders from the daily routine.

## Who it's for

- **Clinic staff / front desk** — the primary operators. They live in the queue:
  triaging arrivals, seeing who has completed intake, and moving patients forward.
- **Patients** — submit the intake form (name, contact, reason for visit, basic
  history) and get an SMS confirmation. Low-friction, mobile-first; no account needed.
- **Clinic owner / operator** _(assumption)_ — the buyer. Cares about front-desk time
  saved and fewer no-shows.

## Core workflow

1. **Patient submits intake form** — the originating event. Personal + contact details,
   reason for visit, basic medical history.
2. **Patient enters the staff queue** — submission creates a queue entry visible to
   staff in real time, with status (e.g. waiting → in progress → seen).
3. **SMS confirmation sent** — on submission, the patient receives a text confirming
   their intake was received.
4. **Staff work the queue** — staff advance each patient through the flow until cleared.

## Core capabilities

- Public, mobile-friendly **intake form** for patients.
- Live **staff queue dashboard** showing checked-in patients and their status.
- Automated **SMS confirmation** on intake submission.

## Positioning

Replaces paper clipboards and manual reminder calls at a small clinic's front desk.
The value is reclaimed front-desk time and fewer no-shows — a single recovered
appointment per week tends to cover the product's cost.

## Tone & brand

- **Tone**: calm, trustworthy, clinical-clean. Reassuring to patients, efficient for
  staff. Privacy-respecting.
- **Name**: **Clearway** (confirmed).
- **One-liner**: "Clearway turns patient intake into a calm, paperless flow for small
  clinics: patients self-complete a no-login mobile form, every submission lands in a
  live staff queue with clear waiting / in progress / seen status, and each patient gets
  an automatic SMS confirmation — reclaiming front-desk time and cutting no-shows."
- **Logo**: set — minimal teal (#0E7C86) clinical-clean mark. Accent color **#0E7C86**
  carries across logo and blueprint.

## Scope (current)

In scope: patient intake form, live staff queue, SMS confirmation.
Out of scope (for now): EHR integration, billing/payments, scheduling/booking,
clinical charting. Revisit as the product proves out.

## Strategic principles

- Front desk first: the queue is the product's home screen for staff.
- Zero friction for patients: no login, mobile-first, minimal fields.
- Confirmation is no-show insurance, not a marketing channel.

## Open questions (to confirm during onboarding)

- The clinic's own name (for in-app labeling) — the product brand is set (Clearway).
- Team size at the front desk and typical weekly patient volume (needed to project impact).
- Whether patients fill the form pre-arrival, on arrival, or both.
