"use client";

import { useRouter } from "next/navigation";
import { ContactRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCustomerMutations } from "@/features/admin/customers/hooks";
import {
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormSelect,
} from "./AdminFormUI";

export function CustomerForm() {
  const router = useRouter();
  const { create: createCustomerMutation } = useCustomerMutations();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "STAFF" | "ADMIN">("CUSTOMER");
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [taxExempt, setTaxExempt] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      toast.error("Email address is required.");
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        password: password || undefined,
        role,
        acceptsMarketing,
        taxExempt,
      });

      toast.success("Customer created successfully!");
      router.push("/admin/users");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create customer");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl pb-10">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <FormCard
            title="Customer information"
            description="Primary identity and contact details for this customer."
            icon={<ContactRound size={18} />}
          >
            <FormGrid>
              <FormField
                label="First name"
                name="firstName"
                autoComplete="given-name"
                placeholder="Amara"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <FormField
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                placeholder="Johnson"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <FormField
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="amara@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormField
                label="Phone number"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 202 555 0124"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                optional
              />
              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Leave blank to auto-generate"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                optional
              />
            </FormGrid>
          </FormCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20">
          <FormCard title="Account" icon={<ShieldCheck size={18} />}>
            <FormSelect
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as "CUSTOMER" | "STAFF" | "ADMIN")}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </FormSelect>
          </FormCard>

          <FormCard title="Preferences">
            <label className="flex cursor-pointer items-center justify-between gap-4 py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-700">Marketing consent</span>
              <input
                type="checkbox"
                checked={acceptsMarketing}
                onChange={(e) => setAcceptsMarketing(e.target.checked)}
                className="size-4 accent-slate-900 rounded"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
              <span className="text-xs font-medium text-slate-700">Tax Exempt</span>
              <input
                type="checkbox"
                checked={taxExempt}
                onChange={(e) => setTaxExempt(e.target.checked)}
                className="size-4 accent-slate-900 rounded"
              />
            </label>
          </FormCard>
        </aside>
      </div>
      <FormActions
        cancelHref="/admin/users"
        submitLabel="Create customer"
        saving={createCustomerMutation.isPending}
      />
    </form>
  );
}
