"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BadgePercent,
  Compass,
  Crown,
  Eye,
  ImageIcon,
  LayoutTemplate,
  LoaderCircle,
  Megaphone,
  RefreshCw,
  Save,
  Sparkles,
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
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <LoaderCircle className="animate-spin text-zinc-900" size={28} />
        <p className="text-xs font-medium text-zinc-500">Loading storefront branding settings...</p>
      </div>
    );
  }

  if (appearance.isError) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <p className="text-xs font-semibold text-zinc-900">{appearance.error.message}</p>
        <button
          type="button"
          onClick={() => appearance.refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800"
        >
          <RefreshCw size={13} /> Retry Loading
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

const bannerTabs = [
  { id: "brand", label: "Brand Identity", icon: Crown, badge: "Header" },
  { id: "hero", label: "Hero Banner", icon: LayoutTemplate, badge: "Main" },
  { id: "promotions", label: "Promo Banners", icon: Megaphone, badge: "2 Offers" },
  { id: "sidebar_shop", label: "Sidebar & Shop", icon: Compass, badge: "Navigation" },
] as const;

function StorefrontAppearanceEditor({
  initialAppearance,
}: {
  initialAppearance: StorefrontAppearance;
}) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(initialAppearance);
  const [activeTab, setActiveTab] = useState<"brand" | "hero" | "promotions" | "sidebar_shop">("brand");

  const save = useMutation({
    mutationFn: updateStorefrontAppearance,
    onSuccess: (appearance) => {
      queryClient.setQueryData(storefrontAppearanceQueryKey, appearance);
      toast.success("Storefront branding & banners saved successfully!");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6 text-zinc-900 font-sans">
      {/* Sub-Tabs Navigation Header */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-1.5 shadow-2xs">
        {bannerTabs.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`group relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-zinc-900 text-white font-semibold shadow-xs"
                  : "text-zinc-600 hover:bg-white hover:text-zinc-900"
              }`}
            >
              <Icon size={15} className={isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900"} />
              <span className="truncate">{label}</span>
              <span
                className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-200/70 text-zinc-600"
                }`}
              >
                {badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Brand Identity */}
      {activeTab === "brand" && (
        <section className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
          <SectionHeader
            title="Brand Logo & Header Identity"
            description="Displayed on the global header across all device viewports."
          />
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <AppearanceImageField
              title="Header Store Logo"
              image={value.logo}
              aspect="logo"
              onChange={(logo) => setValue((current) => ({ ...current, logo }))}
            />
          </div>
        </section>
      )}

      {/* Tab 2: Homepage Hero Banner */}
      {activeTab === "hero" && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <SectionHeader
            title="Homepage Hero Banner"
            description="Customize your primary hero background image, headline typography, button labels, and link destinations."
          />
          <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
              <AppearanceImageField
                title="Hero Background Image (16:9)"
                image={value.hero}
                aspect="wide"
                onChange={(image) =>
                  setValue((current) => ({
                    ...current,
                    hero: { ...current.hero, ...image },
                  }))
                }
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-4">
              <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-zinc-700" /> Banner Copy & Link Options
              </h4>
              <TextField
                label="Eyebrow Subtitle"
                value={value.hero.eyebrow}
                onChange={(eyebrow) =>
                  setValue((current) => ({
                    ...current,
                    hero: { ...current.hero, eyebrow },
                  }))
                }
              />
              <TextField
                label="Main Headline Title"
                value={value.hero.title}
                onChange={(title) =>
                  setValue((current) => ({
                    ...current,
                    hero: { ...current.hero, title },
                  }))
                }
              />
              <TextField
                label="Description Body"
                value={value.hero.description}
                onChange={(description) =>
                  setValue((current) => ({
                    ...current,
                    hero: { ...current.hero, description },
                  }))
                }
              />
              <div className="grid gap-4 sm:grid-cols-2 pt-1">
                <TextField
                  label="Button Label"
                  value={value.hero.linkLabel}
                  onChange={(linkLabel) =>
                    setValue((current) => ({
                      ...current,
                      hero: { ...current.hero, linkLabel },
                    }))
                  }
                />
                <TextField
                  label="Destination Link"
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
      )}

      {/* Tab 3: Promotional Banners */}
      {activeTab === "promotions" && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <SectionHeader
            title="Promotional Offer Banners"
            description="Manage the spotlight promotion cards positioned between homepage catalog categories."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {value.promotions.map((promotion, index) => (
              <div key={index} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <span className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
                    <BadgePercent size={15} className="text-zinc-700" /> Promotion Card #{index + 1}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-700 border border-zinc-200">
                    Active Offer
                  </span>
                </div>
                <AppearanceImageField
                  title="Banner Image (16:9)"
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
                <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-zinc-100">
                  <TextField
                    label="Badge Label"
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
                    label="Target URL Link"
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
      )}

      {/* Tab 4: Sidebar & Shop Banners */}
      {activeTab === "sidebar_shop" && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <SectionHeader
            title="Navigation Drawer & Shop Header Banners"
            description="Visual banners featured inside category drawers and above shop product listings."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {(
              [
                ["Sidebar Top Banner", "top", "wide"],
                ["Sidebar Middle Banner", "middle", "wide"],
                ["Sidebar Bottom Card", "bottom", "portrait"],
              ] as const
            ).map(([title, key, aspect]) => (
              <div key={key} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
                <AppearanceImageField
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
              </div>
            ))}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
              <AppearanceImageField
                title="Shop Main Page Banner"
                image={value.shopBanner}
                aspect="wide"
                onChange={(shopBanner) =>
                  setValue((current) => ({ ...current, shopBanner }))
                }
              />
            </div>
          </div>
        </section>
      )}

      {/* Floating Save Bar */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between rounded-xl border border-zinc-200/90 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
          <span className="size-2 rounded-full bg-zinc-900 animate-pulse" />
          <span>Active Tab: <strong className="text-zinc-900 font-semibold">{bannerTabs.find(t => t.id === activeTab)?.label}</strong></span>
        </div>
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate(value)}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {save.isPending ? (
            <LoaderCircle className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          {save.isPending ? "Saving changes..." : "Save Appearance"}
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
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-zinc-700">{title}</p>
      <div className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 shadow-2xs">
        <Image
          src={image.url}
          alt={image.alt}
          width={800}
          height={500}
          unoptimized
          className={`${ratio} w-full object-cover transition-transform duration-200 group-hover:scale-102`}
        />
        <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-zinc-950/60 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 backdrop-blur-2xs">
          <span className="grid size-9 place-items-center rounded-full bg-white text-zinc-900 shadow-md">
            {uploading ? <LoaderCircle className="animate-spin" size={16} /> : <UploadCloud size={16} />}
          </span>
          <span className="mt-2 text-xs font-medium text-white">
            {uploading ? "Uploading..." : "Replace Image"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => upload(event.target.files?.[0])}
          />
        </label>
      </div>

      <TextField
        label="SEO Alternative Text"
        value={image.alt}
        onChange={(alt) => onChange({ ...image, alt })}
      />
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
        <ImageIcon size={16} className="text-zinc-600" /> {title}
      </h3>
      <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">{description}</p>
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
    <label className="block text-xs font-medium text-zinc-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs font-normal text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />
    </label>
  );
}

