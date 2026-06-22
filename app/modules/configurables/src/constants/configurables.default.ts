/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TIntakeCopy = {
  heading: string;
  subheading?: string;
  submitLabel: string;
  privacyNote?: string;
  confirmationTitle: string;
  confirmationMessage: string;
  urgentNotice: string;
};

export type TQueueCopy = {
  heading: string;
  nurseReviewLabel: string;
  normalQueueLabel: string;
  refreshSeconds: number;
};

export type TSmsConfig = {
  enabled: boolean;
  confirmationTemplate: string;
  urgentTemplate: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  font: TFont;
  clinicName: string;
  tagline?: string;
  intake: TIntakeCopy;
  queue: TQueueCopy;
  sms: TSmsConfig;
  urgentSymptomKeywords?: string[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Clearway",
  logoUrl: "",
  brandColor: {
    // Base — clean whites and very light cool grays
    background:        "#f7f9fa",
    foreground:        "#1a2b2e",
    // Card
    card:              "#ffffff",
    cardForeground:    "#1a2b2e",
    // Popover
    popover:           "#ffffff",
    popoverForeground: "#1a2b2e",
    // Primary — Clearway teal
    primary:           "#0e7c86",
    primaryForeground: "#ffffff",
    // Secondary — soft cool gray
    secondary:           "#e8eef0",
    secondaryForeground: "#1a2b2e",
    // Muted
    muted:           "#eef2f4",
    mutedForeground: "#5b6b6e",
    // Accent — light teal tint
    accent:           "#d7edef",
    accentForeground: "#0a5f66",
    // Destructive — high-contrast alert red (urgent / nurse review)
    destructive:           "#c0392b",
    destructiveForeground: "#ffffff",
    // Border / Input / Ring
    border: "#dbe4e6",
    input:  "#dbe4e6",
    ring:   "#0e7c86",
    // Charts
    chart1: "#0e7c86",
    chart2: "#3aa0a8",
    chart3: "#0a5f66",
    chart4: "#5b8a90",
    chart5: "#c0392b",
    // Navbar
    navbarBackground: "#ffffff",
    // Sidebar
    sidebarBackground:        "#ffffff",
    sidebarForeground:        "#1a2b2e",
    sidebarPrimary:           "#0e7c86",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent:            "#d7edef",
    sidebarAccentForeground:  "#0a5f66",
    sidebarBorder:            "#dbe4e6",
    sidebarRing:              "#0e7c86",
  },
  font: {
    headingFont: "Plus Jakarta Sans",
    textFont: "Inter",
  },
  clinicName: "Clearway Clinic",
  tagline: "A calm, paperless intake for our patients.",
  intake: {
    heading: "Patient check-in",
    subheading:
      "Tell us a little about your visit. It takes about a minute, and you'll get a text once we have you.",
    submitLabel: "Submit check-in",
    privacyNote:
      "Your information is kept private and used only by our clinical staff for your visit.",
    confirmationTitle: "You're checked in",
    confirmationMessage:
      "Thanks — your intake has been received. Please take a seat, and we'll send a text confirmation shortly.",
    urgentNotice:
      "Based on what you described, a nurse will see you as a priority. Please tell the front desk right away if you feel worse.",
  },
  queue: {
    heading: "Live patient queue",
    nurseReviewLabel: "Nurse review — urgent",
    normalQueueLabel: "Waiting queue",
    refreshSeconds: 5,
  },
  sms: {
    enabled: true,
    confirmationTemplate:
      "Hi {{name}}, this is {{clinic}}. We've received your check-in. Please take a seat — staff will call you shortly.",
    urgentTemplate:
      "Hi {{name}}, this is {{clinic}}. We've received your check-in and a nurse will see you as a priority. If you feel worse, alert the front desk immediately.",
  },
  urgentSymptomKeywords: [],
};
