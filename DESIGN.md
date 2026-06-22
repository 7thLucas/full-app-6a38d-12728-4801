## Design Guidelines: Clearway

### Tone
Calm, trustworthy, clinical-clean. Reassuring for patients, efficient for staff. Generous whitespace, low visual noise, no clutter. Privacy-respecting and professional.

### Color
- **Accent / primary**: teal `#0E7C86` (CTAs, active states, brand mark, links).
- **Accent dark** (hover/pressed): a deeper teal, e.g. `#0A5F66`.
- **Surface**: clean whites and very light cool grays (`#F7F9FA`, `#FFFFFF`).
- **Text**: dark slate (`#1A2B2E`) primary, muted gray for secondary.
- **Status semantics**:
  - Waiting: neutral / soft blue-gray.
  - In progress: teal accent.
  - Seen: muted green.
  - **URGENT / Nurse review: high-contrast red/alert** (e.g. `#C0392B`) — must be unmistakably distinct from the normal queue, visually prioritized at the top.

### Typography
Clean, legible sans-serif (system UI / Inter-like). Clear hierarchy: prominent headings, comfortable body, large tap targets for mobile intake.

### Layout & components
- **Intake form**: mobile-first. On desktop a two-pane layout — a reassurance rail (3-step "what happens next") beside the form; on mobile they stack to a single column. Large inputs, label + inline hint per field, big primary teal submit button, reassuring confirmation screen. A live urgent-symptom note appears under "reason for visit" when red-flag terms are typed.
- **Staff queue**: the home screen for staff. A slim summary toolbar (Urgent / Waiting / In progress counts) over two clearly separated lanes:
  1. **Nurse review (urgent)** lane at the TOP — red-accented prominent cards, visually dominant, with matched-symptom chips and a full-width action. Prioritized above the normal queue.
  2. **Normal queue** below — a dense, scannable row list (status dot, name, reason + preferred time, wait, status pill, inline action) so staff scan many patients fast. Rows stack on mobile.
- Real-time polling so new check-ins and status changes appear live; a pulsing "live" dot and last-updated time in the header.
- Skeleton loading (not a center spinner). Status pills with transitions, clear iconography, comfortable spacing. Motion is state/feedback only, with a reduced-motion fallback.

### Accessibility
High contrast, especially for urgent/alert states. Large touch targets. Clear focus states.