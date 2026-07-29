"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ImagePlus,
  Info,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

export const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export function FormCard({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </span>
        )}
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function FormGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  const classes = {
    1: "grid gap-5",
    2: "grid gap-5 sm:grid-cols-2",
    3: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
  };
  return <div className={classes[columns]}>{children}</div>;
}

export function FormField({
  label,
  hint,
  optional,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  optional?: boolean;
}) {
  const generatedId = useId();
  const id = props.id ?? props.name ?? generatedId;
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        {optional && (
          <span className="text-xs font-normal text-slate-400">Optional</span>
        )}
      </span>
      <input {...props} id={id} className={fieldClass} />
      {hint && (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

export function FormSelect({
  label,
  hint,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      {label}
      <select {...props} className={`${fieldClass} appearance-none`}>
        {children}
      </select>
      {hint && (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

export function FormTextarea({
  label,
  hint,
  optional,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="flex items-center justify-between gap-2">
        {label}
        {optional && (
          <span className="text-xs font-normal text-slate-400">Optional</span>
        )}
      </span>
      <textarea {...props} className={`${fieldClass} min-h-28 py-3`} />
      {hint && (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

export function ChoiceCard({
  title,
  description,
  name,
  value,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`relative flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
        checked
          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
          : "border-slate-200 hover:border-slate-400"
      }`}
    >
      <input
        className="mt-0.5 size-4 accent-slate-900"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span>
        <strong className="block text-sm font-semibold text-slate-900">
          {title}
        </strong>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </label>
  );
}

export function ToggleRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b border-slate-100 py-4 last:border-0 first:pt-0 last:pb-0">
      <span>
        <strong className="block text-sm font-medium text-slate-800">
          {title}
        </strong>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 size-4 shrink-0 accent-slate-900"
      />
    </label>
  );
}

type Preview = { url: string; name: string };

export function ImageUploadField({
  label,
  description,
  multiple = false,
  initialUrls = [],
  aspect = "square",
}: {
  label: string;
  description: string;
  multiple?: boolean;
  initialUrls?: string[];
  aspect?: "square" | "wide" | "logo";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>(
    initialUrls.map((url) => ({ url, name: "Current image" })),
  );
  const [error, setError] = useState("");
  const objectUrls = useRef<string[]>([]);

  useEffect(
    () => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  function addFiles(files: FileList | null) {
    if (!files) return;
    const accepted = Array.from(files).filter((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError(`${file.name} must be JPG, PNG, or WebP.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} must be smaller than 5 MB.`);
        return false;
      }
      return true;
    });
    if (!accepted.length) return;
    setError("");
    const next = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      return { url, name: file.name };
    });
    setPreviews((current) => (multiple ? [...current, ...next] : next));
  }

  const ratio = {
    square: "aspect-square",
    wide: "aspect-[16/9]",
    logo: "aspect-[3/2]",
  }[aspect];

  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      {previews.length > 0 && (
        <div
          className={`mb-3 grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}
        >
          {previews.map((preview, index) => (
            <figure
              key={`${preview.url}-${index}`}
              className="group relative m-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <Image
                src={preview.url}
                alt={preview.name}
                width={700}
                height={700}
                unoptimized
                className={`${ratio} w-full object-cover`}
              />
              {index === 0 && multiple && (
                <span className="absolute left-2 top-2 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  setPreviews((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:text-red-600"
                aria-label={`Remove ${preview.name}`}
              >
                <Trash2 size={15} />
              </button>
              <figcaption className="truncate border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                {preview.name}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <label
        className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-6 text-center transition hover:border-slate-500 hover:bg-slate-50 focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <span className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <UploadCloud size={21} />
        </span>
        <span className="mt-3 text-sm font-semibold text-slate-800">
          Drop images here or browse
        </span>
        <span className="mt-1 text-xs text-slate-500">
          JPG, PNG or WebP · Maximum 5 MB
        </span>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={(event) => addFiles(event.target.files)}
        />
      </label>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <Info size={13} /> {error}
        </p>
      )}
    </div>
  );
}

export function EmptyImagePlaceholder() {
  return (
    <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
      <ImagePlus size={24} />
    </div>
  );
}

export function FormActions({
  cancelHref,
  submitLabel,
  saving,
  status = "Unsaved changes",
}: {
  cancelHref: string;
  submitLabel: string;
  saving?: boolean;
  status?: string;
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2 px-1 text-xs text-slate-500">
        <span className="size-2 rounded-full bg-amber-400" />
        {status}
      </span>
      <div className="flex gap-2">
        <Link
          href={cancelHref}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex-none"
        >
          Cancel
        </Link>
        <button
          disabled={saving}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          {saving ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
