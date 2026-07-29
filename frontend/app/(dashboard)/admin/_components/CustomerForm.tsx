"use client";

import { ContactRound, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormSelect,
  ImageUploadField,
  ToggleRow,
} from "./AdminFormUI";

export function CustomerForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Customer created");
      }}
      className="mx-auto max-w-5xl"
    >
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
                required
              />
              <FormField
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                placeholder="Johnson"
                required
              />
              <FormField
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="amara@example.com"
                required
              />
              <FormField
                label="Phone number"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 202 555 0124"
                optional
              />
            </FormGrid>
          </FormCard>

          <FormCard
            title="Default address"
            description="Used as the suggested shipping and billing address."
            icon={<MapPin size={18} />}
          >
            <div className="space-y-5">
              <FormGrid>
                <FormField
                  label="Company"
                  autoComplete="organization"
                  optional
                />
                <FormField label="Address name" placeholder="Home" optional />
              </FormGrid>
              <FormField
                label="Street address"
                autoComplete="address-line1"
                placeholder="120 Atlantic Avenue"
              />
              <FormField
                label="Apartment, suite, etc."
                autoComplete="address-line2"
                optional
              />
              <FormGrid columns={3}>
                <FormField
                  label="City"
                  autoComplete="address-level2"
                  placeholder="Brooklyn"
                />
                <FormSelect label="State" defaultValue="NY">
                  <option value="">Select state</option>
                  <option value="NY">New York</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                </FormSelect>
                <FormField
                  label="ZIP code"
                  autoComplete="postal-code"
                  placeholder="11201"
                />
              </FormGrid>
              <FormSelect label="Country or region" defaultValue="US">
                <option value="US">United States</option>
              </FormSelect>
            </div>
          </FormCard>

          <FormCard title="Internal notes">
            <FormField
              label="Customer tags"
              placeholder="vip, wholesale, stylist"
              optional
              hint="Separate tags with commas."
            />
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Notes
              <textarea
                rows={4}
                placeholder="Add information visible only to staff."
                className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
              />
            </label>
          </FormCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20">
          <FormCard title="Profile image">
            <ImageUploadField
              label="Customer avatar"
              description="Optional profile image visible to administrators."
            />
          </FormCard>
          <FormCard title="Account" icon={<ShieldCheck size={18} />}>
            <FormSelect label="Role" defaultValue="CUSTOMER">
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </FormSelect>
            <div className="mt-5">
              <ToggleRow
                title="Active account"
                description="Allow this customer to sign in."
                defaultChecked
              />
            </div>
          </FormCard>
          <FormCard title="Preferences">
            <ToggleRow
              title="Marketing consent"
              description="Customer agreed to receive promotional email."
            />
            <ToggleRow
              title="Collect tax"
              description="Calculate applicable tax for future orders."
              defaultChecked
            />
          </FormCard>
        </aside>
      </div>
      <FormActions cancelHref="/admin/users" submitLabel="Create customer" />
    </form>
  );
}
