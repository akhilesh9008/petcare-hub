"use client";

import { useEffect, useMemo, useState } from "react";
import { FileCheck2, FileText, FolderUp, ShieldCheck, TriangleAlert, Upload } from "lucide-react";
import { Badge } from "@/components";
import { formatDate, WorkspaceShell } from "@/features/workspace-shell";
import type { PetDocumentCategory } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { formatFileSize, prepareDocumentReview } from "@/lib/document-intake";

const categories: Array<{ value: PetDocumentCategory; label: string }> = [
  { value: "VACCINATION_CERTIFICATE", label: "Vaccination certificate" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "LAB_REPORT", label: "Lab report" },
  { value: "VET_RECORD", label: "Vet record" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PHOTO", label: "Photo" },
  { value: "OTHER", label: "Other" },
];

const statusTone = { PENDING_REVIEW: "orange", VERIFIED: "green", REJECTED: "red" } as const;

export default function DocumentsPage() {
  const { pets, documents, addDocument, verifyDocument } = usePetcare();
  const [petId, setPetId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<PetDocumentCategory>("OTHER");
  const [notice, setNotice] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    if (!pets.some((pet) => pet.id === petId)) setPetId(pets[0]?.id ?? "");
  }, [petId, pets]);

  const review = useMemo(() => file ? prepareDocumentReview(file) : undefined, [file]);
  const orderedDocuments = useMemo(() => [...documents].sort((left, right) => right.importedAt.localeCompare(left.importedAt)), [documents]);

  function chooseFile(nextFile?: File) {
    if (!nextFile) return;
    if (nextFile.size > 15 * 1024 * 1024) {
      setNotice("Choose a file smaller than 15 MB for this local review demo.");
      return;
    }
    const suggestion = prepareDocumentReview(nextFile);
    setFile(nextFile);
    setCategory(suggestion.category);
    setNotice("");
  }

  function saveDocument() {
    if (!file || !petId || !review) {
      setNotice("Choose a pet and a file first.");
      return;
    }
    addDocument({
      petId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      category,
      source: "OWNER_UPLOAD",
      extractedFields: review.fields.map((item) => item.label === "Suggested category" ? { ...item, value: category.replaceAll("_", " ").toLowerCase() } : item),
    });
    setNotice(`${file.name} was added to the review queue. It will not change health records until a person verifies it.`);
    setFile(null);
    setFileInputKey((value) => value + 1);
  }

  return <WorkspaceShell title="Documents" subtitle="A review-first inbox for certificates, records, prescriptions and care files.">
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-6 sm:p-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-2xl"><p className="eyebrow"><FileText size={14} /> Document intake</p><h1 className="mt-2 text-2xl font-black tracking-[-.035em] text-ink">Bring care documents into the Digital Twin safely.</h1><p className="mt-3 text-sm leading-6 text-slate-600">Files are placed in a human review queue with clear provenance. The current local build stores file metadata only; it does not upload or OCR the raw document.</p></div><span className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-3 py-2 text-xs font-bold text-indigo-800 shadow-sm ring-1 ring-indigo-100"><ShieldCheck size={15} /> Review before record update</span></div></section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <div className="surface p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><FolderUp size={19} /></span><div><h2 className="font-black tracking-[-.02em] text-ink">Add a document</h2><p className="mt-1 text-sm leading-5 text-slate-600">Choose a PDF or image from this device. A filename-based suggestion is always reviewable.</p></div></div>
          <div className="mt-5 space-y-4"><label className="block"><span className="field-label">Pet</span><select className="field mt-1" value={petId} onChange={(event) => setPetId(event.target.value)}><option value="">Choose a pet</option>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} · {pet.species}</option>)}</select></label><label className="block"><span className="field-label">File</span><input key={fileInputKey} className="field mt-1 h-auto cursor-pointer py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-teal-800 hover:file:bg-teal-100" type="file" accept="application/pdf,image/*" onChange={(event) => chooseFile(event.target.files?.[0])} /></label><label className="block"><span className="field-label">Category</span><select className="field mt-1" value={category} onChange={(event) => setCategory(event.target.value as PetDocumentCategory)}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          {review ? <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><div className="flex gap-2"><TriangleAlert className="mt-0.5 shrink-0 text-amber-700" size={16} /><div><p className="text-sm font-bold text-amber-950">Suggested review</p><p className="mt-1 text-sm leading-5 text-amber-900">{review.reason}</p><p className="mt-2 text-xs font-semibold text-amber-800">{file?.name} · {file ? formatFileSize(file.size) : ""}</p></div></div></div> : null}
          {notice ? <p className="rounded-xl bg-mint px-3 py-2 text-sm font-semibold text-moss">{notice}</p> : null}
          <button type="button" className="btn-primary w-full" onClick={saveDocument}><Upload size={16} /> Add to review queue</button></div>
        </div>

        <div className="surface p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black tracking-[-.02em] text-ink">Review queue</h2><p className="mt-1 text-sm leading-5 text-slate-600">Metadata remains pet-scoped, visible in the timeline, and must be verified before it guides care.</p></div><Badge tone="violet">{orderedDocuments.length} file{orderedDocuments.length === 1 ? "" : "s"}</Badge></div>
          <div className="mt-5 space-y-3">{orderedDocuments.length ? orderedDocuments.map((document) => { const pet = pets.find((item) => item.id === document.petId); return <article key={document.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-700 shadow-sm"><FileText size={18} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="break-all text-sm font-bold text-ink">{document.fileName}</h3><p className="mt-1 text-xs text-slate-500">{pet?.name ?? "Unknown pet"} · {document.category.replaceAll("_", " ").toLowerCase()} · {formatFileSize(document.sizeBytes)} · added {formatDate(document.importedAt)}</p></div><Badge tone={statusTone[document.status]}>{document.status.replaceAll("_", " ").toLowerCase()}</Badge></div><div className="mt-3 grid gap-2 sm:grid-cols-3">{document.extractedFields.map((field) => <div key={`${document.id}-${field.id}`} className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-100"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">{field.label}</p><p className="mt-1 break-words text-xs leading-4 text-slate-600">{field.value}</p></div>)}</div>{document.status === "PENDING_REVIEW" ? <div className="mt-3 flex justify-end"><button type="button" className="btn-secondary h-8 px-3 text-xs" onClick={() => verifyDocument(document.id)}><FileCheck2 size={14} /> Verify reviewed metadata</button></div> : null}</div></div></article>; }) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"><FileText className="mx-auto text-slate-400" size={25} /><p className="mt-3 font-bold text-ink">No document metadata yet.</p><p className="mt-1 text-sm leading-6 text-slate-500">Add a certificate, report, or image when you are ready to review it.</p></div>}</div>
        </div>
      </section>
    </div>
  </WorkspaceShell>;
}
