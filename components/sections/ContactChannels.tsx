"use client";

import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { SiGithub, SiWhatsapp } from "react-icons/si";

import { contactDetails } from "@/data/contact";
import { cn } from "@/lib/utils";

type Channel = {
  key: "email" | "whatsapp" | "github" | "location";
  icon: ComponentType<{ className?: string }>;
  value: string;
  href?: string;
  external?: boolean;
};

/** The direct routes: email, WhatsApp, GitHub — and where Julião is. */
export default function ContactChannels({ className }: { className?: string }) {
  const t = useTranslations("contact");
  const { email, whatsapp, github } = contactDetails;

  const channels: Channel[] = [
    { key: "email", icon: Mail, value: email, href: `mailto:${email}` },
    {
      key: "whatsapp",
      icon: SiWhatsapp,
      value: whatsapp.display,
      href: `https://wa.me/${whatsapp.digits}`,
      external: true,
    },
    {
      key: "github",
      icon: SiGithub,
      value: `github.com/${github.user}`,
      href: `https://github.com/${github.user}`,
      external: true,
    },
    { key: "location", icon: MapPin, value: t("channels.locationValue") },
  ];

  return (
    <ul data-contact-channels="" className={cn("flex flex-col gap-1", className)}>
      {channels.map(({ key, icon: Icon, value, href, external }) => {
        const body = (
          <>
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-foreground"
            >
              <Icon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm text-muted-foreground">
                {t(`channels.${key}`)}
              </span>
              <span className="truncate font-medium text-foreground">{value}</span>
            </span>
          </>
        );
        return (
          <li key={key}>
            {href ? (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group press -mx-3 flex min-h-11 items-center gap-4 rounded-lg p-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {body}
                {external && <span className="sr-only"> {t("newTab")}</span>}
                <ArrowUpRight
                  aria-hidden="true"
                  className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </a>
            ) : (
              <div className="-mx-3 flex items-center gap-4 p-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
