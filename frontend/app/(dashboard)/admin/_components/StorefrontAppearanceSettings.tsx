"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Save,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AppearanceImage,
  type StorefrontAppearance,
  updateStorefrontAppearance,
  uploadStorefrontImage,
} from "@/features/storefront/appearance/api";
import {
  storefrontAppearanceQueryKey,
  useStorefrontAppearance,
} from "@/features/storefront/appearance/useStorefrontAppearance";

export function StorefrontAppearanceSettings() {
  const appearance = useStorefrontAppearance();

  if (appearance.isPending) {
    return (
      <div className="grid min-h-72 place-items-center">
        <LoaderCircle className="animate-spin text-slate-500" size={26} />
      </div>
    );
  }

  if (appearance.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{appearance.error.message}</p>
        <button
          type="button"
          onClick={() => appearance.refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    );
  }

  return (
    <StorefrontAppearanceEditor
      key={JSON.stringify(appearance.data)}
      initialAppearance={appearance.data}
    />
  );
}

function StorefrontAppearanceEditor({
  initialAppearance,
}: {
  initialAppearance: StorefrontAppearance;
}) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(initialAppearance);
  const save = useMutation({
    mutationFn: updateStorefrontAppearance,
    onSuccess: (appearance) => {
      queryClient.setQueryData(storefrontAppearanceQueryKey, appearance);
      toast.success("Storefront appearance saved");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-7">
      <section>
        <SectionHeading
          title="Brand logo"
          description="Used in the storefront header on every customer page."
        />
        <div className="max-w-sm">
          <AppearanceImageField
            title="Store logo"
            image={value.logo}
            aspect="logo"
            onChange={(logo) => setValue((current) => ({ ...current, logo }))}
          />
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <SectionHeading
          title="Homepage hero"
          description="Controls the large hero image, copy, and destination."
        />
        <div className="grid gap-5 xl:grid-cols-[minmax(300px,1.2fr)_1fr]">
          <AppearanceImageField
            title="Hero image"
            image={value.hero}
            aspect="wide"
            onChange={(image) =>
              setValue((current) => ({
                ...current,
                hero: { ...current.hero, ...image },
              }))
            }
          />
          <div className="grid content-start gap-4">
            <TextField
              label="Eyebrow"
              value={value.hero.eyebrow}
              onChange={(eyebrow) =>
                setValue((current) => ({
                  ...current,
                  hero: { ...current.hero, eyebrow },
                }))
              }
            />
            <TextField
              label="Title"
              value={value.hero.title}
              onChange={(title) =>
                setValue((current) => ({
                  ...current,
                  hero: { ...current.hero, title },
                }))
              }
            />
            <TextField
              label="Description"
              value={value.hero.description}
              onChange={(description) =>
                setValue((current) => ({
                  ...current,
                  hero: { ...current.hero, description },
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Button label"
                value={value.hero.linkLabel}
                onChange={(linkLabel) =>
                  setValue((current) => ({
                    ...current,
                    hero: { ...current.hero, linkLabel },
                  }))
                }
              />
              <TextField
                label="Button link"
                value={value.hero.link}
                onChange={(link) =>
                  setValue((current) => ({
                    ...current,
                    hero: { ...current.hero, link },
                  }))
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <SectionHeading
          title="Promotional banners"
          description="The two offer banners displayed between homepage product sections."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {value.promotions.map((promotion, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-4">
              <AppearanceImageField
                title={`Promotion ${index + 1}`}
                image={promotion}
                aspect="wide"
                onChange={(image) =>
                  setValue((current) => {
                    const promotions = [
                      ...current.promotions,
                    ] as StorefrontAppearance["promotions"];
                    promotions[index] = { ...promotions[index], ...image };
                    return { ...current, promotions };
                  })
                }
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Banner label"
                  value={promotion.label}
                  onChange={(label) =>
                    setValue((current) => {
                      const promotions = [
                        ...current.promotions,
                      ] as StorefrontAppearance["promotions"];
                      promotions[index] = { ...promotions[index], label };
                      return { ...current, promotions };
                    })
                  }
                />
                <TextField
                  label="Banner link"
                  value={promotion.link}
                  onChange={(link) =>
                    setValue((current) => {
                      const promotions = [
                        ...current.promotions,
                      ] as StorefrontAppearance["promotions"];
                      promotions[index] = { ...promotions[index], link };
                      return { ...current, promotions };
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <SectionHeading
          title="Sidebar and shop banners"
          description="Images used around homepage navigation and above shop results."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ["Sidebar top", "top", "wide"],
              ["Sidebar middle", "middle", "wide"],
              ["Sidebar bottom", "bottom", "portrait"],
            ] as const
          ).map(([title, key, aspect]) => (
            <AppearanceImageField
              key={key}
              title={title}
              image={value.sidebar[key]}
              aspect={aspect}
              onChange={(image) =>
                setValue((current) => ({
                  ...current,
                  sidebar: { ...current.sidebar, [key]: image },
                }))
              }
            />
          ))}
          <AppearanceImageField
            title="Shop banner"
            image={value.shopBanner}
            aspect="wide"
            onChange={(shopBanner) =>
              setValue((current) => ({ ...current, shopBanner }))
            }
          />
        </div>
      </section>

      <div className="sticky bottom-3 flex justify-end rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate(value)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {save.isPending ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {save.isPending ? "Saving..." : "Save storefront"}
        </button>
      </div>
    </div>
  );
}

function AppearanceImageField({
  title,
  image,
  aspect,
  onChange,
}: {
  title: string;
  image: AppearanceImage;
  aspect: "logo" | "wide" | "portrait";
  onChange: (image: AppearanceImage) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ratio = {
    logo: "aspect-[3/2]",
    wide: "aspect-[16/9]",
    portrait: "aspect-[4/5]",
  }[aspect];

  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadStorefrontImage(file);
      onChange({ ...image, url });
      toast.success(`${title} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <Image
          src={image.url}
          alt={image.alt}
          width={800}
          height={500}
          unoptimized
          className={`${ratio} w-full object-cover`}
        />
      </div>
      <TextField
        label="Alternative text"
        value={image.alt}
        onChange={(alt) => onChange({ ...image, alt })}
      />
      <label className="mt-3 flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        {uploading ? (
          <LoaderCircle className="animate-spin" size={16} />
        ) : (
          <UploadCloud size={16} />
        )}
        {uploading ? "Uploading..." : "Replace image"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </label>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <ImageIcon size={17} /> {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-3 block text-xs font-medium text-slate-600">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
      />
    </label>
  );
}
