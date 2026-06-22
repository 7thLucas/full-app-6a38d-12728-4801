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
- **Intake form**: mobile-first, single column, large inputs, big primary teal submit button. Minimal fields, clear labels, reassuring confirmation screen.
- **Staff queue**: the home screen for staff. Two clearly separated lanes:
  1. **Nurse review (urgent)** lane at the TOP — red-accented, visually dominant, prioritized above the normal queue.
  2. **Normal queue** below — patient cards with status pills (waiting / in progress / seen) and an advance-status control.
- Real-time updates so new check-ins and status changes appear live.
- Status pills, clear iconography, comfortable spacing. Cards over dense tables for readability.

### Accessibility
High contrast, especially for urgent/alert states. Large touch targets. Clear focus states.