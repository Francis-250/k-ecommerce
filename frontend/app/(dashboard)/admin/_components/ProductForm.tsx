"use client";

import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  DollarSign,
  ImagePlus,
  Layers,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { CatalogProduct } from "@/features/storefront/shop/catalog-data";
import {
  fieldClass,
  FormActions,
  FormField,
  FormGrid,
  FormSelect,
  FormTextarea,
  ImageUploadField,
  ToggleRow,
} from "./AdminFormUI";
import { CatalogModal } from "./CatalogModal";
import { useProductMutations } from "@/features/admin/catalog/hooks";

type VariantRow = {
  id: number;
  name: string;
  sku: string;
  price: string;
  quantity: string;
};

export function ProductForm({
  product,
  onSave,
  onClose,
}: {
  product?: CatalogProduct;
  onSave?: (savedProduct: CatalogProduct) => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  const productMutations = useProductMutations();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [category, setCategory] = useState(product?.category ?? "Dresses");
  const [audience, setAudience] = useState<CatalogProduct["audience"]>(
    product?.audience ?? "Women",
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [trackInventory, setTrackInventory] = useState(true);
  const [status, setStatus] = useState("ACTIVE");
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.image ? [product.image] : [],
  );

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        sku: "",
        price: price || (product?.price ? String(product.price) : ""),
        quantity: "0",
      },
    ]);
  }

  function updateVariant(
    id: number,
    field: keyof Omit<VariantRow, "id">,
    value: string,
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant,
      ),
    );
  }

  function removeVariant(id: number) {
    setVariants((current) => current.filter((variant) => variant.id !== id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const formData = new FormData(event.currentTarget);

    const priceNum = parseFloat(price) || 0;
    const productName = name.trim() || "New Product";
    const skuVal = (formData.get("sku") as string)?.trim() || undefined;
    const descVal = (formData.get("description") as string)?.trim() || undefined;
    const selectedImage = imageUrls[0] || product?.image;

    const slug = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const payload = {
      name: productName,
      slug,
      price: priceNum,
      sku: skuVal,
      description: descVal,
      categoryName: category || "Dresses",
      status: status as "ACTIVE" | "DRAFT" | "ARCHIVED",
      audience: (audience.toUpperCase() === "WOMEN"
        ? "WOMEN"
        : audience.toUpperCase() === "MEN"
          ? "MEN"
          : audience.toUpperCase() === "KIDS"
            ? "KIDS"
            : "UNISEX") as "WOMEN" | "MEN" | "UNISEX" | "KIDS",
      isFeatured: featured,
      publishedAt: status === "ACTIVE" ? new Date().toISOString() : null,
      imageUrl: selectedImage || undefined,
      images: imageUrls.length ? imageUrls : undefined,
    };

    const savedProduct: CatalogProduct = {
      id: product?.id ?? (Date.now() as any),
      slug,
      name: productName,
      price: priceNum,
      category: category || "Dresses",
      audience: audience || "Women",
      image: selectedImage || "/storefront/assets/img/african-products/ankara-midi-dress.png",
      featured,
    };

    const isEdit = Boolean(product?.id && String(product.id).length > 5);

    if (isEdit && product?.id) {
      productMutations.update.mutate(
        { id: String(product.id), input: payload },
        {
          onSuccess: () => {
            setSaving(false);
            toast.success("Product updated in catalogue");
            if (onSave) onSave(savedProduct);
            else router.push("/admin/products");
          },
          onError: (err) => {
            setSaving(false);
            toast.error(err.message || "Failed to update product");
          },
        },
      );
    } else {
      productMutations.create.mutate(payload, {
        onSuccess: () => {
          setSaving(false);
          toast.success("Product created in catalogue");
          if (onSave) onSave(savedProduct);
          else router.push("/admin/products");
        },
        onError: (err) => {
          setSaving(false);
          toast.error(err.message || "Failed to create product");
        },
      });
    }
  }

  function handleClose() {
    if (!saving) {
      if (onClose) {
        onClose();
      } else {
        router.push("/admin/products");
      }
    }
  }

  return (
    <CatalogModal
      title={product ? "Edit product" : "Add product"}
      description={
        product
          ? `Update ${product.name} details.`
          : "Add a new item to your online catalogue."
      }
      onClose={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        className="-mx-4 -my-4 sm:-mx-6 sm:-my-6 p-5 sm:p-6 space-y-8 bg-white min-h-full flex flex-col justify-between"
      >
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#082f35]">
                <Package size={17} />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Product information</h3>
                <p className="text-xs text-slate-500">Basic details customers see when browsing your storefront.</p>
              </div>
            </div>
            <div className="space-y-4">
              <FormField
                label="Product title"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Handwoven Cotton Dress"
                required
                autoFocus
              />

              <FormGrid columns={2}>
                <FormField
                  label="SKU (Stock Keeping Unit)"
                  name="sku"
                  defaultValue={product ? `SKU-00${product.id}` : ""}
                  placeholder="IRAS-001"
                  required
                />
                <FormField
                  label="Barcode (UPC, EAN, or ISBN)"
                  name="barcode"
                  placeholder="123456789012"
                  optional
                />
              </FormGrid>

              <FormTextarea
                label="Description"
                name="description"
                rows={4}
                defaultValue={
                  product
                    ? `${product.name} is handcrafted with care for comfort, quality, and effortless style.`
                    : ""
                }
                placeholder="Describe the materials, fit, construction, and styling details."
                hint="Provide comprehensive details to help customers make an informed choice."
                required
              />
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#082f35]">
                <ImagePlus size={17} />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Product media</h3>
                <p className="text-xs text-slate-500">Upload photography showcasing the product from multiple angles.</p>
              </div>
            </div>
            <ImageUploadField
              label="Product images"
              description="JPG, PNG, or WebP. Images selected here are uploaded directly to Cloudinary."
              multiple
              initialUrls={product?.image ? [product.image] : []}
              aspect="square"
              onChange={(urls) => setImageUrls(urls)}
            />
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#082f35]">
                <DollarSign size={17} />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Pricing & inventory</h3>
                <p className="text-xs text-slate-500">Set retail prices, cost tracking, and stock management rules.</p>
              </div>
            </div>
            <div className="space-y-4">
              <FormGrid columns={3}>
                <FormField
                  label="Selling price ($)"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <FormField
                  label="Compare-at price ($)"
                  name="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  optional
                  hint="Original price before discount."
                />
                <FormField
                  label="Cost per item ($)"
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  optional
                  hint="Customers won't see this."
                />
              </FormGrid>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <ToggleRow
                  title="Track inventory"
                  description="Automatically update stock counts when items are sold."
                  defaultChecked={trackInventory}
                />

                <div className="mt-4 grid gap-4 border-t border-slate-200/80 pt-4 sm:grid-cols-2">
                  <FormField
                    label="Available quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    defaultValue="15"
                  />
                  <FormField
                    label="Low-stock alert threshold"
                    name="reorderPoint"
                    type="number"
                    min="0"
                    defaultValue="5"
                    hint="Notify when stock falls below this quantity."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#082f35]">
                <Layers size={17} />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Variants & options</h3>
                <p className="text-xs text-slate-500">Add options if this product comes in different sizes, colors, or materials.</p>
              </div>
            </div>
            {variants.length === 0 ? (
              <button
                type="button"
                onClick={addVariant}
                className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-left transition hover:border-slate-400 hover:bg-slate-50"
              >
                <div>
                  <strong className="block text-sm font-semibold text-slate-800">
                    Does this product have sizes or colors?
                  </strong>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    Add variants with individual SKUs, prices, and quantities.
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                  <Plus size={14} /> Add variant
                </span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add another variant
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="grid items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_.8fr_.7fr_auto]"
                    >
                      <label className="text-xs font-medium text-slate-700">
                        Option title
                        <input
                          value={variant.name}
                          onChange={(e) =>
                            updateVariant(variant.id, "name", e.target.value)
                          }
                          className={fieldClass}
                          placeholder="e.g. Medium / Black"
                        />
                      </label>
                      <label className="text-xs font-medium text-slate-700">
                        SKU
                        <input
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariant(variant.id, "sku", e.target.value)
                          }
                          className={fieldClass}
                          placeholder="IRAS-001-M"
                        />
                      </label>
                      <label className="text-xs font-medium text-slate-700">
                        Price ($)
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(variant.id, "price", e.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                      <label className="text-xs font-medium text-slate-700">
                        Stock Qty
                        <input
                          type="number"
                          min="0"
                          value={variant.quantity}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "quantity",
                              e.target.value,
                            )
                          }
                          className={fieldClass}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="mb-0.5 grid size-10 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Remove variant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#082f35]">
                <BadgeCheck size={17} />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Visibility & organization</h3>
                <p className="text-xs text-slate-500">Control storefront visibility, categories, and target audience.</p>
              </div>
            </div>
            <div className="space-y-4">
              <FormGrid columns={2}>
                <FormSelect
                  label="Product status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active (Visible in storefront)</option>
                  <option value="DRAFT">Draft (Hidden from customers)</option>
                  <option value="ARCHIVED">Archived</option>
                </FormSelect>

                <FormSelect
                  label="Category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {["Accessories", "Dresses", "Tops", "Handbags"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </FormSelect>
              </FormGrid>

              <FormGrid columns={2}>
                <FormSelect label="Brand" name="brand" defaultValue="I-RAS STYLES">
                  <option value="I-RAS STYLES">I-RAS STYLES</option>
                  <option value="Independent designer">Independent designer</option>
                </FormSelect>

                <FormSelect
                  label="Target audience"
                  name="audience"
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as CatalogProduct["audience"])
                  }
                >
                  {["Women", "Men", "Unisex", "Kids"].map((aud) => (
                    <option key={aud} value={aud}>
                      {aud}
                    </option>
                  ))}
                </FormSelect>
              </FormGrid>

              <ToggleRow
                title="Featured product"
                description="Show in curated storefront lists."
                defaultChecked={featured}
              />

              <FormField
                label="Tags"
                name="tags"
                placeholder="new, occasion, cotton"
                optional
                hint="Separate keywords with commas."
              />
            </div>
          </section>
        </div>

        <FormActions
          cancelHref="/admin/products"
          submitLabel={product ? "Save product" : "Create product"}
          saving={saving}
        />
      </form>
    </CatalogModal>
  );
}
