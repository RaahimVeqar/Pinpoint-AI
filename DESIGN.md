# Pinpoint AI Design System

Pinpoint AI should feel like premium coaching intelligence: calm under pressure, evidence-led, and unmistakably tennis-specific without leaning on sports clichés.

## Visual principles

- Lead with the coaching decision, then reveal the supporting evidence.
- Use editorial hierarchy and ruled sections before reaching for cards.
- Reserve court green for primary actions, selection, and positive/approved states.
- Keep data readable and literal. Never rely on color alone to communicate status.
- Use tennis-court line geometry sparingly as structure, not decoration.
- Prefer a few strong sections with clear hierarchy over grids of equal-weight modules.

## Typography

- Geist is the single interface family. It is used for headings, body copy, controls, and data.
- Page title: 2.25rem desktop / 1.875rem mobile, 650 weight, tight but never below -0.04em tracking.
- Section title: 1.25rem, 650 weight. Subsection title: 1rem, 650 weight.
- Body: 0.9375-1rem with 1.55-1.7 line height. Long prose is capped near 70ch.
- Metadata: 0.8125rem, 550-600 weight. Avoid all-caps eyebrow labels and excessive tracking.
- Numeric evidence uses tabular numerals.

## Spacing

- The base rhythm is 4px with primary steps at 8, 12, 16, 24, 32, 48, and 64px.
- Page sections generally use 32-48px vertical separation.
- Related control groups use 16px gaps; label-to-control spacing is 8px.
- Desktop content is capped at 1248px. Reading copy is capped near 70ch.

## Surface hierarchy

1. Canvas: cool, near-white neutral for the application background.
2. Working surface: white, typically separated by a 1px border with no shadow.
3. Recessed surface: pale green-neutral for filters, summaries, and expanded evidence.
4. Emphasis surface: deep ink for one high-value statement or report header per view.

Borders do most grouping work. Low elevation is reserved for navigation and transient hover feedback. Containers use 8-12px radii; controls use 8px; status indicators may be pill-shaped.

## Interaction rules

- Primary actions are solid court green and appear once per workflow stage.
- Secondary actions are white with a clear border. Tertiary actions are text-forward.
- Every control has hover, active, disabled, and visible `focus-visible` states.
- Touch targets are at least 44px high.
- State transitions run 160-220ms with an ease-out curve.
- Expansion motion is limited to supporting evidence and state changes. Reduced-motion preferences disable nonessential motion.
- Progressive disclosure hides optional context and detailed evidence, never the primary coaching takeaway.

## Patterns to avoid

- Generic metric-card dashboards and identical feature grids.
- Cards nested inside cards.
- Purple/blue AI gradients, gradient text, glass effects, or esports styling.
- Tiny uppercase section eyebrows and decorative badges.
- Low-contrast gray body copy.
- Oversized radii, wide soft shadows, and decoration-only icons.
- Showing every analysis field at the same visual weight.
