/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        // ── Base ────────────────────────────────────────────────────────────
        { fieldName: "background",        type: "color", required: true,  label: "Background" },
        { fieldName: "foreground",        type: "color", required: true,  label: "Foreground" },
        // ── Card ────────────────────────────────────────────────────────────
        { fieldName: "card",              type: "color", required: true,  label: "Card" },
        { fieldName: "cardForeground",    type: "color", required: true,  label: "Card Foreground" },
        // ── Popover ─────────────────────────────────────────────────────────
        { fieldName: "popover",           type: "color", required: true,  label: "Popover" },
        { fieldName: "popoverForeground", type: "color", required: true,  label: "Popover Foreground" },
        // ── Primary ─────────────────────────────────────────────────────────
        { fieldName: "primary",           type: "color", required: true,  label: "Primary" },
        { fieldName: "primaryForeground", type: "color", required: true,  label: "Primary Foreground" },
        // ── Secondary ───────────────────────────────────────────────────────
        { fieldName: "secondary",           type: "color", required: true,  label: "Secondary" },
        { fieldName: "secondaryForeground", type: "color", required: true,  label: "Secondary Foreground" },
        // ── Muted ───────────────────────────────────────────────────────────
        { fieldName: "muted",           type: "color", required: true,  label: "Muted" },
        { fieldName: "mutedForeground", type: "color", required: true,  label: "Muted Foreground" },
        // ── Accent ──────────────────────────────────────────────────────────
        { fieldName: "accent",           type: "color", required: true,  label: "Accent" },
        { fieldName: "accentForeground", type: "color", required: true,  label: "Accent Foreground" },
        // ── Destructive ─────────────────────────────────────────────────────
        { fieldName: "destructive",           type: "color", required: true,  label: "Destructive" },
        { fieldName: "destructiveForeground", type: "color", required: true,  label: "Destructive Foreground" },
        // ── Border / Input / Ring ────────────────────────────────────────────
        { fieldName: "border", type: "color", required: true, label: "Border" },
        { fieldName: "input",  type: "color", required: true, label: "Input" },
        { fieldName: "ring",   type: "color", required: true, label: "Ring" },
        // ── Charts ──────────────────────────────────────────────────────────
        { fieldName: "chart1", type: "color", required: false, label: "Chart 1" },
        { fieldName: "chart2", type: "color", required: false, label: "Chart 2" },
        { fieldName: "chart3", type: "color", required: false, label: "Chart 3" },
        { fieldName: "chart4", type: "color", required: false, label: "Chart 4" },
        { fieldName: "chart5", type: "color", required: false, label: "Chart 5" },
        // ── Navbar ──────────────────────────────────────────────────────────
        { fieldName: "navbarBackground", type: "color", required: true, label: "Navbar Background" },
        // ── Sidebar ─────────────────────────────────────────────────────────
        { fieldName: "sidebarBackground",        type: "color", required: true,  label: "Sidebar Background" },
        { fieldName: "sidebarForeground",        type: "color", required: true,  label: "Sidebar Foreground" },
        { fieldName: "sidebarPrimary",           type: "color", required: true,  label: "Sidebar Primary" },
        { fieldName: "sidebarPrimaryForeground", type: "color", required: true,  label: "Sidebar Primary Foreground" },
        { fieldName: "sidebarAccent",            type: "color", required: true,  label: "Sidebar Accent" },
        { fieldName: "sidebarAccentForeground",  type: "color", required: true,  label: "Sidebar Accent Foreground" },
        { fieldName: "sidebarBorder",            type: "color", required: true,  label: "Sidebar Border" },
        { fieldName: "sidebarRing",              type: "color", required: true,  label: "Sidebar Ring" },
      ],
    },

    {
      fieldName: "font",
      type: "object",
      required: true,
      label: "Typography",
      fields: [
        {
          fieldName: "headingFont",
          type: "enum",
          required: true,
          label: "Heading Font",
          options: [
            "Inter",
            "Inter Tight",
            "Plus Jakarta Sans",
            "Poppins",
            "Montserrat",
            "Raleway",
            "Playfair Display",
            "Lora",
            "Merriweather",
            "EB Garamond",
            "Cinzel",
            "Cormorant Garamond",
            "Libre Baskerville",
            "PT Serif",
            "Nunito",
            "Outfit",
            "DM Sans",
            "Sora",
            "Space Grotesk",
            "Josefin Sans",
            "Rubik",
            "Quicksand",
            "Figtree",
            "Lexend",
          ],
        },
        {
          fieldName: "textFont",
          type: "enum",
          required: true,
          label: "Text Font",
          options: [
            "Inter",
            "Inter Tight",
            "Plus Jakarta Sans",
            "Poppins",
            "Montserrat",
            "Raleway",
            "Lora",
            "Merriweather",
            "EB Garamond",
            "Libre Baskerville",
            "PT Serif",
            "Nunito",
            "Outfit",
            "DM Sans",
            "Sora",
            "Source Sans 3",
            "Noto Sans",
            "Lato",
            "Open Sans",
            "Roboto",
            "Rubik",
            "Quicksand",
            "Figtree",
            "Lexend",
          ],
        },
      ],
    },

    // ── Clinic identity (owner-facing) ─────────────────────────────────────
    {
      fieldName: "clinicName",
      type: "string",
      required: true,
      label: "Clinic Name",
      minLength: 1,
      maxLength: 120,
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 200,
    },

    // ── Intake form copy ───────────────────────────────────────────────────
    {
      fieldName: "intake",
      type: "object",
      required: true,
      label: "Intake Form",
      fields: [
        { fieldName: "heading", type: "string", required: true, label: "Form Heading", maxLength: 120 },
        { fieldName: "subheading", type: "string", required: false, label: "Form Subheading", maxLength: 300 },
        { fieldName: "submitLabel", type: "string", required: true, label: "Submit Button Label", maxLength: 60 },
        { fieldName: "privacyNote", type: "string", required: false, label: "Privacy Note", maxLength: 300 },
        { fieldName: "confirmationTitle", type: "string", required: true, label: "Confirmation Title", maxLength: 120 },
        { fieldName: "confirmationMessage", type: "string", required: true, label: "Confirmation Message", maxLength: 400 },
        { fieldName: "urgentNotice", type: "string", required: true, label: "Urgent Routing Notice", maxLength: 400 },
      ],
    },

    // ── Staff queue copy ───────────────────────────────────────────────────
    {
      fieldName: "queue",
      type: "object",
      required: true,
      label: "Staff Queue",
      fields: [
        { fieldName: "heading", type: "string", required: true, label: "Queue Heading", maxLength: 120 },
        { fieldName: "nurseReviewLabel", type: "string", required: true, label: "Nurse Review Lane Label", maxLength: 80 },
        { fieldName: "normalQueueLabel", type: "string", required: true, label: "Normal Queue Label", maxLength: 80 },
        { fieldName: "refreshSeconds", type: "number", required: true, label: "Live Refresh Interval (seconds)", min: 2, max: 120 },
      ],
    },

    // ── SMS confirmation ───────────────────────────────────────────────────
    {
      fieldName: "sms",
      type: "object",
      required: true,
      label: "SMS Confirmation",
      fields: [
        { fieldName: "enabled", type: "boolean", required: true, label: "Send SMS Confirmation" },
        { fieldName: "confirmationTemplate", type: "string", required: true, label: "Confirmation Message Template", maxLength: 320 },
        { fieldName: "urgentTemplate", type: "string", required: true, label: "Urgent Message Template", maxLength: 320 },
      ],
    },

    // ── Triage policy (urgent symptom list is owner-extendable) ────────────
    {
      fieldName: "urgentSymptomKeywords",
      type: "array",
      required: false,
      label: "Additional Urgent Symptom Keywords",
      item: { type: "string", required: true },
    },
  ],
};