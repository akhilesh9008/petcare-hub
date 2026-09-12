"use client";

import { ChangeEvent, useEffect, useId, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 4 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 480_000;

export interface PetPhotoUploadProps {
  value?: string;
  onChange: (value?: string) => void;
  petName?: string;
  className?: string;
}

/**
 * Converts a device image into a compact JPEG data URL so it can be safely
 * retained with the local demo profile without sending it to any third party.
 */
async function createLocalPhoto(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("We could not read that image."));
      element.src = objectUrl;
    });

    let maximumDimension = 1080;
    let quality = 0.84;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const scale = Math.min(1, maximumDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) throw new Error("This browser could not prepare the image.");

      // JPEG does not preserve transparency; a white background keeps PNG uploads clean.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;

      if (quality > 0.56) quality -= 0.1;
      else {
        maximumDimension = Math.round(maximumDimension * 0.78);
        quality = 0.76;
      }
    }

    throw new Error("That photo is too detailed to save locally. Try a smaller image.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function PetPhotoUpload({ value, onChange, petName = "your pet", className = "" }: PetPhotoUploadProps) {
  const inputId = useId();
  const [preview, setPreview] = useState(value);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => setPreview(value), [value]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Let someone select the same image again after making a correction.
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("Choose an image smaller than 4 MB.");
      return;
    }

    setError("");
    setProcessing(true);
    try {
      const localPhoto = await createLocalPhoto(file);
      setPreview(localPhoto);
      onChange(localPhoto);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not prepare that image.");
    } finally {
      setProcessing(false);
    }
  }

  function clearPhoto() {
    setPreview(undefined);
    setError("");
    onChange(undefined);
  }

  return (
    <div className={`rounded-2xl border border-dashed border-moss/30 bg-mint/45 p-4 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white bg-white text-moss shadow-sm">
          {preview ? <img src={preview} alt={`${petName}'s profile`} className="h-full w-full object-cover" /> : <Camera size={25} aria-hidden="true" />}
          {processing ? <span className="absolute inset-0 grid place-items-center bg-white/80"><Loader2 className="animate-spin" size={21} /></span> : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">Pet profile photo</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">Choose a device photo for a more recognizable passport. It is optimized and stored only in this browser&apos;s local demo data.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label htmlFor={inputId} className={`btn-secondary cursor-pointer ${processing ? "pointer-events-none opacity-60" : ""}`}>
              <ImagePlus size={16} />
              {preview ? "Replace photo" : "Choose photo"}
            </label>
            {preview ? <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={clearPhoto} disabled={processing}><Trash2 size={15} /> Remove</button> : null}
          </div>
          <input id={inputId} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP up to 4 MB. No upload to an external service.</p>
          {error ? <p className="mt-2 text-xs font-semibold text-rose-700" role="alert">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
