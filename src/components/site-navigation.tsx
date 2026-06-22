"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/players", label: "Players" },
  { href: "/matches", label: "Matches" },
  { href: "/tagging", label: "Clip Analysis" },
  { href: "/reports", label: "Reports" },
  { href: "/elite-library", label: "Elite Library" },
];

export function SiteNavigation() {
  const pathname = usePathname();

  const taglinePhrases = [
    "Analyzing the moments that decide outcomes",
    "Where elite patterns inform player development",
    "Turning pressure points into coaching insight",
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-sm font-bold text-white">
            P
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight text-slate-950">
              Pinpoint AI
            </span>
            <span className="tagline-marquee" aria-label={taglinePhrases[0]}>
              <span className="tagline-marquee__track" aria-hidden="true">
                {[0, 1].map((copy) => (
                  <span className="tagline-marquee__group" key={copy}>
                    {taglinePhrases.map((phrase) => (
                      <span className="tagline-marquee__item" key={phrase}>
                        {phrase}
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </Link>
        <div className="flex flex-wrap gap-2">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
