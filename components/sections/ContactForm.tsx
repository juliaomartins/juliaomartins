"use client";

import { useGSAP } from "@gsap/react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type ReactNode } from "react";

import { sendContactForm } from "@/lib/api/contact";
import { cn } from "@/lib/utils";
import { gsap } from "@/motion/registry";
import { duration, ease, offset } from "@/motion/tokens";
import { ContactFormData } from "@/types/contact";

import ContactChannels from "./ContactChannels";

const initialFormData: ContactFormData = {
  Username: "",
  Email: "",
  Message: "",
};

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldId = "name" | "email" | "message";
type Status = "idle" | "sending" | "sent" | "error";

/**
 * Shared field styling. Sized so every control clears the 44px touch target,
 * with a 16px font so iOS never zooms on focus (text-control).
 */
const fieldClass = cn(
  "press w-full rounded-lg border border-field-border bg-background px-4 py-3",
  "text-control text-foreground outline-none",
  "hover:border-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
  "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30",
  "disabled:cursor-not-allowed disabled:opacity-60"
);

function Field({
  id,
  label,
  error,
  aside,
  children,
}: {
  id: FieldId;
  label: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {/* Always rendered so the reserved line never shifts the form. */}
      <p
        id={`${id}-error`}
        data-field-error=""
        className="min-h-5 text-sm text-destructive"
      >
        {error}
      </p>
    </div>
  );
}

/**
 * Contact: the direct routes on the left, the form on the right (stacked on
 * small screens). The request is unchanged — `{ data: { Username, Email,
 * Message } }` to the SheetDB endpoint.
 *
 * - Fields are checked when you leave them and on submit, with messages next
 *   to the field (aria-invalid + aria-describedby); a failed submit moves
 *   focus to the first problem.
 * - Sent: the form gives way to a confirmation that thanks you by name and
 *   takes focus; "Send another message" brings back an empty form.
 * - Failed: an alert explains, and everything typed is kept.
 */
export default function ContactForm() {
  const t = useTranslations("contact");
  const rootRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [touched, setTouched] = useState<Record<FieldId, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [sentName, setSentName] = useState("");

  const errors: Partial<Record<FieldId, string>> = {};
  if (!formData.Username.trim()) errors.name = t("errors.name");
  if (!EMAIL_PATTERN.test(formData.Email.trim())) errors.email = t("errors.email");
  if (formData.Message.trim().length < MESSAGE_MIN) {
    errors.message = t("errors.message", { min: MESSAGE_MIN });
  }
  const shown = (id: FieldId) =>
    touched[id] || submitted ? errors[id] : undefined;

  // The confirmation settles in and takes focus, so screen readers hear it.
  useGSAP(
    () => {
      if (status !== "sent") return;
      const panel = rootRef.current?.querySelector<HTMLElement>(
        "[data-contact-success]"
      );
      if (!panel) return;
      panel.querySelector<HTMLElement>("h3")?.focus();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(panel, {
          autoAlpha: 0,
          y: offset.rise,
          duration: duration.md,
          ease: ease.out,
          clearProps: "opacity,visibility,transform",
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [status] }
  );

  const update =
    (key: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));
      if (status === "error") setStatus("idle");
    };
  const touch = (id: FieldId) => () =>
    setTouched((prev) => ({ ...prev, [id]: true }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    const firstInvalid = (["name", "email", "message"] as const).find(
      (id) => errors[id]
    );
    if (firstInvalid) {
      ({ name: nameRef, email: emailRef, message: messageRef })[
        firstInvalid
      ].current?.focus();
      return;
    }

    setStatus("sending");
    try {
      await sendContactForm({
        Username: formData.Username.trim(),
        Email: formData.Email.trim(),
        Message: formData.Message.trim(),
      });
      setSentName(formData.Username.trim());
      setFormData(initialFormData);
      setTouched({ name: false, email: false, message: false });
      setSubmitted(false);
      setStatus("sent");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const again = () => {
    setStatus("idle");
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const describedBy = (id: FieldId, extra?: string) =>
    [`${id}-error`, extra].filter(Boolean).join(" ");

  return (
    <section
      ref={rootRef}
      id="contact"
      className="mx-auto max-w-6xl px-6 py-24 md:py-32"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* min-w-0: a grid item will not shrink below its content, so the long
            email would push the row past a 360px screen instead of truncating. */}
        <div className="min-w-0 lg:col-span-5">
          <h2 className="text-h2 font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-4 text-lead text-muted-foreground">{t("intro")}</p>
          <ContactChannels className="mt-10" />
        </div>

        <div className="min-w-0 rounded-xl bg-card p-6 ring-1 ring-border md:p-8 lg:col-span-7">
          {status === "sent" ? (
            <div
              data-contact-success=""
              className="flex min-h-96 flex-col items-start justify-center gap-4"
            >
              <CheckCircle2 aria-hidden="true" className="size-10 text-primary" />
              <h3 tabIndex={-1} className="text-h2 font-semibold outline-none">
                {t("successTitle")}
              </h3>
              <p className="text-lead text-muted-foreground">
                {t("successBody", { name: sentName })}
              </p>
              <button
                type="button"
                onClick={again}
                className="press mt-4 inline-flex min-h-11 items-center rounded-full border border-field-border px-6 text-sm font-medium text-foreground hover:border-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
              >
                {t("again")}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-2"
            >
              <p className="mb-4 text-sm text-muted-foreground">
                {t("form.required")}
              </p>

              <Field id="name" label={t("form.name")} error={shown("name")}>
                <input
                  ref={nameRef}
                  id="name"
                  name="Username"
                  type="text"
                  autoComplete="name"
                  value={formData.Username}
                  onChange={update("Username")}
                  onBlur={touch("name")}
                  aria-invalid={shown("name") ? true : undefined}
                  aria-describedby={describedBy("name")}
                  disabled={status === "sending"}
                  className={cn(fieldClass, "min-h-11")}
                />
              </Field>

              <Field id="email" label={t("form.email")} error={shown("email")}>
                <input
                  ref={emailRef}
                  id="email"
                  name="Email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={formData.Email}
                  onChange={update("Email")}
                  onBlur={touch("email")}
                  aria-invalid={shown("email") ? true : undefined}
                  aria-describedby={describedBy("email")}
                  disabled={status === "sending"}
                  className={cn(fieldClass, "min-h-11")}
                />
              </Field>

              <Field
                id="message"
                label={t("form.message")}
                error={shown("message")}
                aside={
                  <span
                    id="message-count"
                    className="text-sm tabular-nums text-muted-foreground"
                  >
                    {t("form.counter", {
                      count: formData.Message.length,
                      max: MESSAGE_MAX,
                    })}
                  </span>
                }
              >
                <textarea
                  ref={messageRef}
                  id="message"
                  name="Message"
                  rows={6}
                  maxLength={MESSAGE_MAX}
                  value={formData.Message}
                  onChange={update("Message")}
                  onBlur={touch("message")}
                  aria-invalid={shown("message") ? true : undefined}
                  aria-describedby={describedBy("message", "message-count")}
                  disabled={status === "sending"}
                  className={cn(fieldClass, "min-h-36 resize-y")}
                />
              </Field>

              {status === "error" && (
                <p
                  role="alert"
                  className="mb-4 flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-foreground"
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                  />
                  {t("error")}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className={cn(
                  "group press inline-flex min-h-12 w-full items-center justify-center gap-3",
                  "rounded-lg bg-primary px-6 text-control font-medium text-primary-foreground",
                  "outline-none cursor-pointer hover:opacity-90 active:scale-98",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                )}
              >
                {status === "sending" ? (
                  <>
                    {t("form.sending")}
                    <span
                      aria-hidden
                      className="submit-spinner size-4 shrink-0 rounded-full border-2 border-current border-t-transparent"
                    />
                  </>
                ) : (
                  <>
                    {t("form.send")}
                    <Send
                      aria-hidden="true"
                      className="size-4 shrink-0 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
