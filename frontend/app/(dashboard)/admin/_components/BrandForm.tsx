"use client";

import { BadgeCheck, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormSelect,
  FormTextarea,
  ImageUploadField,
  ToggleRow,
} from "./AdminFormUI";

export function BrandForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Brand created");
      }}
      className="mx-auto max-w-5xl"
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <FormCard
            title="Brand information"
            description="Create the public identity customers see on product pages."
            icon={<Building2 size={18} />}
          >
            <div className="space-y-5">
              <FormGrid>
                <FormField
                  label="Brand name"
                  name="name"
                  placeholder="I-RAS STYLES"
                  required
                />
                <FormField
                  label="URL handle"
                  name="slug"
                  placeholder="iras-styles"
                  required
                  hint="Lowercase letters, numbers, and hyphens."
                />
              </FormGrid>
              <FormTextarea
                label="Description"
                rows={6}
                placeholder="Tell customers about the brand, its origin, and design philosophy."
                hint="A focused description improves brand discovery and product context."
              />
            </div>
          </FormCard>

          <FormCard title="Contact and origin">
            <FormGrid>
              <FormSelect label="Country or region" defaultValue="US">
                <option value="US">United States</option>
                <option value="RW">Rwanda</option>
                <option value="GH">Ghana</option>
                <option value="NG">Nigeria</option>
              </FormSelect>
              <FormField
                label="Website"
                type="url"
                placeholder="https://example.com"
                optional
              />
              <FormField
                label="Contact email"
                type="email"
                placeholder="hello@example.com"
                optional
              />
              <FormField
                label="Established year"
                type="number"
                min="1800"
                max="2100"
                placeholder="2020"
                optional
              />
            </FormGrid>
          </FormCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20">
          <FormCard
            title="Brand logo"
            description="Shown in brand listings and product attribution."
          >
            <ImageUploadField
              label="Logo image"
              description="Use a transparent PNG or WebP with generous spacing."
              aspect="logo"
            />
          </FormCard>
          <FormCard title="Availability" icon={<BadgeCheck size={18} />}>
            <ToggleRow
              title="Active brand"
              description="Allow this brand to appear on the storefront."
              defaultChecked
            />
            <ToggleRow
              title="Featured brand"
              description="Make this brand eligible for homepage promotion."
            />
          </FormCard>
        </aside>
      </div>
      <FormActions cancelHref="/admin/brands" submitLabel="Create brand" />
    </form>
  );
}
