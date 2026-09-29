import type { PetDocumentCategory, PetDocumentField } from "@/features/demo-data";

export interface DocumentReviewSuggestion {
  category: PetDocumentCategory;
  reason: string;
  fields: PetDocumentField[];
}

function field(id: string, label: string, value: string, confidence: PetDocumentField["confidence"]): PetDocumentField {
  return { id, label, value, confidence, status: "PENDING_REVIEW" };
}

/**
 * A deliberately conservative client-side intake helper. It classifies file
 * names for a review queue; it does not read, OCR, diagnose, or write clinical
 * data into a passport. A production worker can replace this with secure OCR.
 */
export function prepareDocumentReview(file: Pick<File, "name" | "type" | "size">): DocumentReviewSuggestion {
  const normalized = file.name.toLowerCase();
  let category: PetDocumentCategory = "OTHER";
  let reason = "The category was not inferred from the file name. Choose it during review.";

  if (/vacc|rabies|dhpp|booster|certificate|immuni[sz]/.test(normalized)) {
    category = "VACCINATION_CERTIFICATE";
    reason = "The file name suggests a vaccination certificate. Confirm the vaccine and dates before using it in the passport.";
  } else if (/prescri|medicine|medicat|rx\b/.test(normalized)) {
    category = "PRESCRIPTION";
    reason = "The file name suggests a prescription. A human must confirm medication details before adding any medicine record.";
  } else if (/lab|blood|urine|test|report/.test(normalized)) {
    category = "LAB_REPORT";
    reason = "The file name suggests a lab report. Results are not interpreted by this product.";
  } else if (/visit|consult|record|discharge|clinical/.test(normalized)) {
    category = "VET_RECORD";
    reason = "The file name suggests a veterinary record. Confirm the visit details before they inform the health timeline.";
  } else if (/invoice|receipt|bill/.test(normalized)) {
    category = "INVOICE";
    reason = "The file name suggests an invoice or receipt.";
  } else if ((file.type || "").startsWith("image/")) {
    category = "PHOTO";
    reason = "This is an image file. Add a clear description before relying on it during a care handoff.";
  }

  return {
    category,
    reason,
    fields: [
      field("file-name", "File name", file.name, "HIGH"),
      field("suggested-category", "Suggested category", category.replaceAll("_", " ").toLowerCase(), "LOW"),
      field("review-state", "Review requirement", "Human review required before this information can guide care.", "HIGH"),
    ],
  };
}

export function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
