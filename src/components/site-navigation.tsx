"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryItems = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/matches", label: "Matches" },
  { href: "/tagging", label: "Analyze Clip" },
  { href: "/elite-library", label: "Elite Library" },
  { href: "/reports", label: "Reports" },
];

const builderItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/dataset", label: "Dataset" },
];

const taglinePhrases = [
  "Analyzing the moments that decide outcomes",
  "Elite patterns, translated for development",
  "Pressure points into coaching action",
];

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function SiteNavigation() {
  const pathname = usePathname();
  const builderIsActive = builderItems.some((item) =>
    isCurrent(pathname, item.href),
  );

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand-row">
          <Link href="/" className="brand-link" aria-label="Pinpoint AI home">
            <span className="brand-mark" aria-hidden="true">
              <span>P</span>
            </span>
            <span className="brand-copy">
              <span className="brand-name">Pinpoint AI</span>
              <span className="brand-category">Tennis intelligence</span>
            </span>
          </Link>

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
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <div className="primary-nav__scroll">
            {primaryItems.map((item) => {
              const active = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link ${active ? "nav-link--active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <details className="builder-menu">
            <summary
              className={`nav-link builder-menu__trigger ${builderIsActive ? "nav-link--active" : ""}`}
            >
              Builder
              <span aria-hidden="true" className="builder-menu__chevron">⌄</span>
            </summary>
            <div className="builder-menu__panel">
              <p>Internal tools</p>
              {builderItems.map((item) => {
                const active = isCurrent(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={active ? "builder-link builder-link--active" : "builder-link"}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
