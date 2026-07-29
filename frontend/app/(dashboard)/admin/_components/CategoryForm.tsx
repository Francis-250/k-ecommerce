"use client";

import { FolderTree, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChoiceCard,
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormSelect,
  FormTextarea,
  ImageUploadField,
  ToggleRow,
} from "./AdminFormUI";

export function CategoryForm() {
  const [type, setType] = useState("manual");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Category created");
      }}
      className="mx-auto max-w-5xl"
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <FormCard
            title="Category details"
            description="Organise products into a clear storefront destination."
            icon={<FolderTree size={18} />}
          >
            <div className="space-y-5">
              <FormField
                label="Category title"
                placeholder="Dresses"
                required
              />
              <FormTextarea
                label="Description"
                rows={6}
                placeholder="Describe the products customers will find in this category."
              />
              <FormGrid>
                <FormField label="URL handle" placeholder="dresses" required />
                <FormSelect label="Parent category">
                  <option value="">No parent category</option>
                  <option>Fashion</option>
                  <option>Accessories</option>
                </FormSelect>
              </FormGrid>
            </div>
          </FormCard>

          <FormCard
            title="Product assignment"
            description="Choose how products become part of this category."
            icon={<SlidersHorizontal size={18} />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                name="category-type"
                value="manual"
                title="Manual"
                description="Select each product yourself and control the exact order."
                checked={type === "manual"}
                onChange={() => setType("manual")}
              />
              <ChoiceCard
                name="category-type"
                value="automatic"
                title="Automatic"
                description="Include products that match rules for tags, price, or brand."
                checked={type === "automatic"}
                onChange={() => setType("automatic")}
              />
            </div>
            {type === "automatic" && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-4 text-sm font-semibold text-slate-800">
                  Match all conditions
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <FormSelect label="Field">
                    <option>Product tag</option>
                    <option>Brand</option>
                    <option>Price</option>
                  </FormSelect>
                  <FormSelect label="Condition">
                    <option>is equal to</option>
                    <option>contains</option>
                    <option>is greater than</option>
                  </FormSelect>
                  <FormField label="Value" placeholder="occasion" />
                </div>
              </div>
            )}
          </FormCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20">
          <FormCard title="Category image">
            <ImageUploadField
              label="Cover image"
              description="Use a strong lifestyle image with enough space for overlaid text."
              aspect="wide"
            />
          </FormCard>
          <FormCard title="Visibility">
            <ToggleRow
              title="Active category"
              description="Show this category in storefront navigation."
              defaultChecked
            />
            <FormField
              label="Sort priority"
              type="number"
              min="0"
              defaultValue="0"
              hint="Lower numbers appear first."
            />
          </FormCard>
        </aside>
      </div>
      <FormActions
        cancelHref="/admin/categories"
        submitLabel="Create category"
      />
    </form>
  );
}
