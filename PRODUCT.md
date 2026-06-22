## Product: Clearway

Clearway is a patient intake dashboard for a small clinic. It removes the front-desk clipboard and manual reminder calls. Patients self-complete a no-login, mobile-first intake form; staff watch a live queue; every submission is screened for urgent symptoms and routed accordingly; patients get an automatic SMS confirmation.

### Users
- **Clinic staff / front desk** (primary operators): live in the queue — triaging arrivals, seeing completed intakes, moving patients forward (waiting -> in progress -> seen).
- **Patients**: submit intake (name, contact, reason, basic history), get an SMS confirmation. Low-friction, mobile-first, no account.
- **Triage nurse / clinical reviewer**: handles the urgent-review path; sees red-flag intakes (e.g. chest pain) pulled out of the normal queue.

### Core workflow
1. Patient submits intake form (name, phone for SMS + optional email, reason for visit, basic medical history). This creates a queue entry.
2. **Urgent-symptom triage (safety-critical)**: every submission is screened against an explicit, inspectable `triage_policy` BEFORE it reaches the normal queue. If urgent symptoms are present (e.g. chest pain, difficulty breathing, severe bleeding, stroke signs), the entry is flagged URGENT and routed to a separate, prioritized "Nurse review" lane — NEVER the normal waiting queue.
3. Non-urgent submissions create a normal queue entry visible to staff in real time with status waiting -> in progress -> seen.
4. SMS confirmation sent on submission (stub/simulate and clearly log/record the send if no live provider is wired, so the flow is demonstrable end to end).
5. Staff work the queue and advance each patient; a nurse handles the urgent-review lane.

### Triage policy (non-negotiable)
- Urgent / red-flag symptoms must route to nurse review BEFORE the normal queue. A chest-pain intake must NEVER sit in the normal waiting queue.
- The urgent-symptom list / triage rule lives in ONE clear, inspectable place (a `triage_policy` module/config) so it can be cited and extended.
- Acceptance: a patient entering "chest pain" as their reason is routed to nurse review ahead of the normal queue.

### Scope
In scope: patient intake form, urgent-symptom triage routing to nurse review, live staff queue dashboard, automatic SMS confirmation.
Out of scope: EHR integration, billing/payments, scheduling/booking, clinical charting.

### Tone & brand
Calm, trustworthy, clinical-clean. Reassuring to patients, efficient for staff. Privacy-respecting. Name: Clearway (confirmed). Accent color #0E7C86.

### Strategic principles
- Safety first: urgent symptoms always route to nurse review before the normal queue. Non-negotiable.
- Front desk first: the live queue is the staff home screen.
- Zero friction for patients: no login, mobile-first, minimal fields.
- Confirmation is no-show insurance, not a marketing channel.