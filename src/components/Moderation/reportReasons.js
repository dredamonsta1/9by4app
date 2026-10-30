// Report reasons, labelled the same way as the iOS ReportSheet.
//
// The server owns the list (GET /moderation/report/reasons) and rejects
// anything else with a 400, which a user reads as "reporting is broken".
// So the dialog asks the server, labels what it knows, and only falls back
// to this order if that request fails.

export const REASON_LABELS = {
  harassment: "Harassment or bullying",
  hate_speech: "Hate speech",
  violence: "Violence or threats",
  sexual_content: "Sexual content",
  self_harm: "Self-harm or suicide",
  spam: "Spam",
  impersonation: "Impersonation",
  misinformation: "False information",
  copyright: "Copyright infringement",
  other: "Something else",
};

export const FALLBACK_REASONS = Object.keys(REASON_LABELS);

/** A reason the server added before this file knew about it still gets a readable label. */
export const reasonLabel = (reason) =>
  REASON_LABELS[reason] ??
  reason.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/** Server reasons in the iOS order, with any unknown ones before "other". */
export const orderReasons = (reasons) => {
  const known = FALLBACK_REASONS.filter((r) => reasons.includes(r) && r !== "other");
  const unknown = reasons.filter((r) => !REASON_LABELS[r]);
  return [...known, ...unknown, ...(reasons.includes("other") ? ["other"] : [])];
};

/** Feed post_type → the report target_type the server expects. */
export const postTargetType = (postType) =>
  !postType || postType === "text" ? "post" : `${postType}_post`;
