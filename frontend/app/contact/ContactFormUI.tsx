"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { sendContactMessage } from "@/features/storefront/content/api";

export function ContactFormUI() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendContactMessage({ name, email, subject, phone, message });
      toast.success(res.message || "Message sent successfully!");
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="coron-form" onSubmit={handleSubmit}>
      <div className="coron-two">
        <input name="name" aria-label="Name" placeholder="Name *" required />
        <input
          name="email"
          aria-label="Email"
          placeholder="Email *"
          type="email"
          required
        />
        <input name="subject" aria-label="Subject" placeholder="Subject" />
        <input name="phone" aria-label="Phone" placeholder="Phone" type="tel" />
      </div>
      <textarea name="message" aria-label="Message" placeholder="Message *" required />
      <button className="coron-btn" type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
