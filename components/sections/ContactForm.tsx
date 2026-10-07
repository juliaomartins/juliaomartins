"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { sendContactForm } from "@/lib/api/contact";
import { ContactFormData } from "@/types/contact";

const initialFormData: ContactFormData = {
  Username: "",
  Email: "",
  Message: "",
};

/**
 * Shared field styling. Composed as utilities rather than @apply, and sized so
 * every control clears the 44px touch target (min-h-11 = 2.75rem = 44px).
 */
const fieldClass = [
  "press w-full rounded-lg border border-field-border bg-background px-4 py-3",
  "text-control text-foreground",
  "outline-none",
  "hover:border-muted-foreground/60",
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

const labelClass =
  "text-eyebrow font-mono uppercase text-muted-foreground";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const t = useTranslations();

  /* Form handlers */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await sendContactForm(formData);
      setMessage(t("contact.success"));
      setFormData(initialFormData);
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error) {
      setMessage(t("contact.error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Presentation only. These READ the existing `message` state to decide how to
   * paint the status line — they never write state and never touch what is
   * submitted. Removing them would change nothing about the request.
   */
  const isError = message !== "" && message === t("contact.error");
  const isSuccess = message !== "" && message === t("contact.success");

  return (
    <section
      id="contact"
      className="flex min-h-svh items-center justify-center px-5 py-24"
    >
      <div className="mx-auto w-full max-w-xl">
        <h2 className="text-h2 font-semibold text-foreground">
          {t("contact.title")}
        </h2>

        <div className="mt-6 mb-10 h-px w-full bg-border" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className={labelClass}>
              {t("contact.form.username")}
            </label>
            <input
              id="username"
              name="Username"
              type="text"
              autoComplete="name"
              value={formData.Username}
              onChange={handleInputChange}
              required
              className={`${fieldClass} min-h-11`}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={labelClass}>
              {t("contact.form.email")}
            </label>
            <input
              id="email"
              name="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={formData.Email}
              onChange={handleInputChange}
              required
              className={`${fieldClass} min-h-11`}
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className={labelClass}>
              {t("contact.form.message")}
            </label>
            <textarea
              id="message"
              name="Message"
              rows={5}
              value={formData.Message}
              onChange={handleInputChange}
              required
              className={`${fieldClass} min-h-32 resize-y`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            aria-describedby="contact-status"
            className={[
              "group press inline-flex min-h-12 w-full items-center justify-center gap-3",
              "rounded-lg bg-primary px-6 text-control font-medium text-primary-foreground",
              "outline-none cursor-pointer",
              "hover:opacity-90",
              "active:scale-98",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
            ].join(" ")}
          >
            {loading ? (
              <>
                {t("contact.form.sending")}
                <span
                  aria-hidden
                  className="submit-spinner size-4 shrink-0 rounded-full border-2 border-current border-t-transparent"
                />
              </>
            ) : (
              <>
                {t("contact.form.send")}
                <Send
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>

          {/*
            Always rendered, so the live region exists before it has anything to
            announce and the height it reserves cannot shift the layout.
          */}
          <p
            id="contact-status"
            role="status"
            aria-live="polite"
            className={[
              "min-h-6 text-center text-note",
              isError
                ? "text-destructive"
                : isSuccess
                  ? "text-foreground"
                  : "text-muted-foreground",
            ].join(" ")}
          >
            {message}
          </p>
        </form>
      </div>
    </section>
  );
}
