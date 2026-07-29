"use client";

import { CalendarDays, Percent, ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChoiceCard,
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormSelect,
  ToggleRow,
} from "./AdminFormUI";

export function CouponForm() {
  const [method, setMethod] = useState("code");
  const [discountType, setDiscountType] = useState("percentage");
  const [requirement, setRequirement] = useState("none");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Discount created");
      }}
      className="mx-auto max-w-5xl"
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <FormCard
            title="Discount method"
            description="Choose how customers receive this offer."
            icon={<Percent size={18} />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                name="method"
                value="code"
                title="Discount code"
                description="Customers enter a code during checkout."
                checked={method === "code"}
                onChange={() => setMethod("code")}
              />
              <ChoiceCard
                name="method"
                value="automatic"
                title="Automatic discount"
                description="Applied automatically when conditions are met."
                checked={method === "automatic"}
                onChange={() => setMethod("automatic")}
              />
            </div>
            <div className="mt-5">
              <FormField
                label={method === "code" ? "Discount code" : "Internal title"}
                placeholder={method === "code" ? "WELCOME10" : "Summer offer"}
                required
                hint={
                  method === "code"
                    ? "Customers will enter this code exactly as shown."
                    : "Customers do not see this title."
                }
              />
            </div>
          </FormCard>

          <FormCard title="Discount value">
            <FormGrid>
              <FormSelect
                label="Discount type"
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value)}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
                <option value="shipping">Free shipping</option>
                <option value="buy-x-get-y">Buy X get Y</option>
              </FormSelect>
              {discountType !== "shipping" && (
                <FormField
                  label={
                    discountType === "percentage"
                      ? "Percentage"
                      : "Discount amount"
                  }
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? "100" : undefined}
                  step="0.01"
                  placeholder={discountType === "percentage" ? "10" : "15.00"}
                  required
                />
              )}
            </FormGrid>
            {discountType === "buy-x-get-y" && (
              <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <FormField
                  label="Customer buys quantity"
                  type="number"
                  min="1"
                  defaultValue="2"
                />
                <FormField
                  label="Customer receives quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                />
                <FormSelect label="Eligible products">
                  <option>Any product</option>
                  <option>Specific products</option>
                  <option>Specific categories</option>
                </FormSelect>
                <FormSelect label="Discount on reward">
                  <option>100% off</option>
                  <option>Percentage off</option>
                </FormSelect>
              </div>
            )}
          </FormCard>

          <FormCard
            title="Customer eligibility"
            description="Control who can redeem this offer."
            icon={<UsersRound size={18} />}
          >
            <FormSelect label="Eligible customers">
              <option>All customers</option>
              <option>Specific customer segments</option>
              <option>Specific customers</option>
            </FormSelect>
          </FormCard>

          <FormCard title="Minimum requirements">
            <FormSelect
              label="Requirement"
              value={requirement}
              onChange={(event) => setRequirement(event.target.value)}
            >
              <option value="none">No minimum requirements</option>
              <option value="amount">Minimum purchase amount</option>
              <option value="quantity">Minimum quantity of items</option>
            </FormSelect>
            {requirement !== "none" && (
              <div className="mt-5">
                <FormField
                  label={
                    requirement === "amount"
                      ? "Minimum amount"
                      : "Minimum quantity"
                  }
                  type="number"
                  min={requirement === "amount" ? "0" : "1"}
                  step={requirement === "amount" ? "0.01" : "1"}
                  placeholder={requirement === "amount" ? "75.00" : "2"}
                  required
                />
              </div>
            )}
          </FormCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20">
          <FormCard title="Usage limits" icon={<ShieldCheck size={18} />}>
            <ToggleRow
              title="Limit total redemptions"
              description="Set a maximum number of uses across all customers."
            />
            <FormField
              label="Maximum uses"
              type="number"
              min="1"
              placeholder="500"
              optional
            />
            <div className="mt-4">
              <ToggleRow
                title="One use per customer"
                description="Prevent repeated use by the same account."
              />
            </div>
          </FormCard>

          <FormCard title="Active dates" icon={<CalendarDays size={18} />}>
            <div className="space-y-5">
              <FormField label="Start date" type="date" required />
              <FormField label="Start time" type="time" defaultValue="00:00" />
              <FormField label="End date" type="date" optional />
              <FormField label="End time" type="time" optional />
            </div>
          </FormCard>

          <FormCard title="Combinations">
            <ToggleRow
              title="Product discounts"
              description="Combine with product-level discounts."
            />
            <ToggleRow
              title="Shipping discounts"
              description="Combine with free or reduced shipping."
            />
          </FormCard>
        </aside>
      </div>
      <FormActions cancelHref="/admin/coupons" submitLabel="Create discount" />
    </form>
  );
}
