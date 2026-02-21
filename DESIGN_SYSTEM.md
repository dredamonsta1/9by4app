# 9by4 Design System

**Version 2.0 — "Raw & Premium"** | Last updated: 2026-02-21

A comprehensive design system for 9by4 -- a music artist discovery and social platform where users browse artists across all genres, vote on their favorites through the clout system, curate personal lists, share posts, and follow other music fans.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Foundations](#2-foundations)
   - [Color System](#21-color-system)
   - [Typography](#22-typography)
   - [Spacing](#23-spacing)
   - [Layout Grid](#24-layout-grid)
3. [Components](#3-components)
4. [Patterns](#4-patterns)
5. [Design Tokens (CSS Custom Properties)](#5-design-tokens)
6. [Motion & Animation](#6-motion--animation)

---

## 1. Design Principles

### Personality: Raw & Premium

9by4's visual language draws from high-end creative tools (Ableton, Final Cut, Logic Pro) and streetwear aesthetics. The result feels like a cockpit or studio control surface — precise, dark, tactile — with creator street cred. Every surface should feel *recessed* or *elevated* with purpose; nothing floats aimlessly.

**Key characteristics:**
- **Sharper shapes**: 8px default radius (down from 12px) — precision, not softness
- **Deeper contrast**: Surface colors have wider gaps, inputs feel *recessed* into the UI
- **Tighter shadows**: Smaller blur, higher opacity — shadows are defined, not diffused
- **Industrial typography**: Heavier weights, tighter letter-spacing on headings
- **Cockpit controls**: Inset shadows on inputs, monospace numbers on stat displays
- **Subtle texture**: CSS noise grain at 2.5% opacity adds analog warmth
- **Content is hero**: Artist images dominate, UI recedes — the stage, not the scaffolding

**Empowerment emotion**: Users should feel like they're operating a powerful instrument, not browsing a generic web app. The interface communicates competence and control.

### Core Principles

**1. Every Genre Has a Stage**
9by4 was born in hip-hop but is built for all music. Design decisions must never assume a single genre. Color coding, imagery, and language should be welcoming to fans of country, electronic, classical, jazz, metal, pop, and everything in between. When in doubt, lean on the universal language of music -- rhythm, energy, and community -- rather than genre-specific visual tropes.

**2. Clout Is Earned, Not Bought**
The voting and ranking system is the heartbeat of 9by4. Every interaction that involves clout should feel weighty and intentional, not throwaway. Animations should celebrate the act of voting. Rankings should be visually prominent but never overwhelming. The design should make users feel that their vote genuinely matters.

**3. Dark Stage, Bright Spotlight**
The dark theme is not decorative -- it is the stage. Content (artist images, post media, user avatars) is the performer under the spotlight. Backgrounds recede, surfaces are subtle, and the accent blue gradient draws attention only where action is needed. This principle keeps the interface from competing with the content it exists to showcase.

### Do's and Don'ts

| # | Do | Don't |
|---|---|---|
| 1 | **Do** use genre-neutral secondary colors (violet, amber, teal) for tags and badges so no single genre "owns" a color. | **Don't** assign fixed colors to specific genres (e.g., "red = rock, green = reggae"). Genres are user-defined strings; hard-coding colors creates a maintenance and inclusivity problem. |
| 2 | **Do** use the accent gradient (`#0077B6 -> #00B4D8`) exclusively for primary actions: submit buttons, active tabs, the logo, and clout vote buttons. This preserves its meaning as "this is actionable." | **Don't** apply the accent gradient to passive elements like card backgrounds, section dividers, or decorative areas. Overuse dilutes its signal and fatigues the eye. |
| 3 | **Do** provide loading skeletons that mirror the exact shape of the content they replace (card skeleton matches card layout, feed skeleton matches post layout). This gives users spatial memory of where things will appear. | **Don't** use a single generic spinner for all loading states. A centered spinner gives no information about what is loading or where it will appear, and causes layout shift when content arrives. |
| 4 | **Do** keep interactive hit targets at minimum 44x44px on mobile (following WCAG 2.5.8). Pad small badges and icon buttons with invisible touch area if the visual element is smaller. | **Don't** make text-only buttons or small icon buttons without adequate padding. The delete button on posts (currently 4px 10px padding) and the copy button on invite codes are examples that need touch-area expansion on mobile. |
| 5 | **Do** use consistent border-radius values from the token system: `--radius-xs` (3px) for micro elements, `--radius-sm` (4px) for inner elements/inputs, `--radius` (8px) for cards and sections, `--radius-pill` (500px) for buttons and badges. | **Don't** introduce arbitrary border-radius values. Consolidate to the four-tier system. The sharper 8px default radius (down from 12px) is intentional — it conveys precision. |

---

## 2. Foundations

### 2.1 Color System

#### Design Rationale

The existing palette is a deep navy/ocean-blue system that evokes the feel of a concert stage in a dim venue -- dark, immersive, with controlled pops of cool-blue light. This refinement preserves that identity while adding three secondary accent hues (violet, amber, teal) to provide variety for genre tags, badges, and data visualization without genre-specific connotations.

#### Background & Surface Colors

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--color-bg-base` | `#0A1420` | Deepest background | Page body, scrollbar track, app shell |
| `--color-bg-surface` | `#0F1A2A` | Raised surface | NavBar, sidebar, overlay panels |
| `--color-bg-card` | `#142030` | Card default | ArtistCard, FeedPost, section containers |
| `--color-bg-card-hover` | `#1A2C42` | Card hover | Card backgrounds on pointer hover |
| `--color-bg-card-elevated` | `#1E3450` | Elevated card | Dropdowns, popovers, modals, search results |
| `--color-bg-input` | `#080F1A` | Input field bg | Text inputs, textareas — recessed darker than base |
| `--color-bg-overlay` | `rgba(0,0,0,0.82)` | Modal scrim | Dramatic semi-opaque backdrop behind modals |

**Surface elevation hierarchy:** base (0) < surface (1) < card (2) < card-elevated (3). Each step is approximately +6-8% lighter to create a subtle depth stack without harsh borders.

#### Text Colors

| Token | Hex | Contrast on `#162333` | Role |
|-------|-----|-----------------------|------|
| `--color-text-primary` | `#E0E6ED` | 10.2:1 | Body text, primary content |
| `--color-text-secondary` | `#8899AA` | 4.8:1 | Captions, timestamps, helper text |
| `--color-text-bright` | `#FFFFFF` | 13.1:1 | Headings, active/emphasized text |
| `--color-text-disabled` | `#556677` | 2.8:1 | Disabled labels (pair with disabled bg, not alone) |
| `--color-text-inverse` | `#0B1622` | N/A | Text on light/accent backgrounds |

**Contrast verification (v2.0 — Raw & Premium):**
- `--color-text-primary` (`#E0E6ED`) on `--color-bg-card` (`#142030`): ~10.5:1 (passes AAA)
- `--color-text-secondary` (`#8899AA`) on `--color-bg-card` (`#142030`): ~5.0:1 (passes AA)
- `--color-text-bright` (`#FFFFFF`) on `--color-bg-base` (`#0A1420`): ~17:1 (passes AAA)
- `--color-text-secondary` (`#8899AA`) on `--color-bg-base` (`#0A1420`): ~6.0:1 (passes AA)

#### Primary Accent (Blue)

The signature 9by4 blue. Used for primary actions, the brand logo, active states, and focus rings.

| Token | Value | Role |
|-------|-------|------|
| `--color-accent` | `#0077B6` | Primary action color, solid buttons |
| `--color-accent-hover` | `#005F92` | Button hover, link hover |
| `--color-accent-active` | `#004D77` | Button active/pressed state |
| `--color-accent-light` | `#00B4D8` | Links, highlights, secondary accent |
| `--color-accent-subtle` | `rgba(0,119,182,0.15)` | Badge backgrounds, tag backgrounds |
| `--color-accent-glow` | `rgba(0,119,182,0.3)` | Focus rings, glow shadows |
| `--color-accent-gradient` | `linear-gradient(135deg, #0077B6, #00B4D8)` | Primary buttons, logo, CTA elements |

#### Secondary Accents

These provide color variety for badges, tags, and data visualization without being tied to any specific genre.

**Violet** -- Used for: rank badges (alternative), special events, premium/featured indicators.

| Token | Value |
|-------|-------|
| `--color-violet` | `#7C5CFC` |
| `--color-violet-hover` | `#6A4AE0` |
| `--color-violet-subtle` | `rgba(124,92,252,0.15)` |

**Amber** -- Used for: warning states, gold/1st rank, certification badges, trending indicators.

| Token | Value |
|-------|-------|
| `--color-amber` | `#F5A623` |
| `--color-amber-hover` | `#D4901E` |
| `--color-amber-subtle` | `rgba(245,166,35,0.15)` |

Contrast check: `#F5A623` on `#162333` = 5.8:1 (passes AA for normal text).

**Teal** -- Used for: success-adjacent states, "new" indicators, active/online status.

| Token | Value |
|-------|-------|
| `--color-teal` | `#2DD4A8` |
| `--color-teal-hover` | `#20B890` |
| `--color-teal-subtle` | `rgba(45,212,168,0.15)` |

#### Semantic Colors

| Token | Hex | Subtle BG | Role |
|-------|-----|-----------|------|
| `--color-success` | `#00E676` | `rgba(0,230,118,0.12)` | Success toasts, approved badges, confirmation |
| `--color-error` | `#FF6B6B` | `rgba(255,107,107,0.12)` | Error toasts, delete buttons, validation errors |
| `--color-warning` | `#FFB347` | `rgba(255,179,71,0.12)` | Warning toasts, pending badges, caution states |
| `--color-info` | `#00B4D8` | `rgba(0,180,216,0.12)` | Info toasts, help text, informational badges |

#### Hot / Trending Accent

A dedicated red accent for trending content, fire indicators, and urgency. **Not** the same as `--color-error` — hot is celebratory/exciting, error is negative/destructive.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-hot` | `#FF4D4D` | Trending badges, "hot" indicators, fire icons |
| `--color-hot-hover` | `#E03E3E` | Hover state on hot elements |
| `--color-hot-subtle` | `rgba(255,77,77,0.12)` | Background for hot badges |
| `--color-hot-glow` | `rgba(255,77,77,0.3)` | Glow effect on trending items |

**When to use `--color-hot` vs `--color-error`:**
- `--color-hot`: Positive energy — "this artist is trending", "hot take", fire emoji contexts
- `--color-error`: Negative feedback — validation errors, delete confirmations, failed actions

#### Border Colors

| Token | Hex | Role |
|-------|-----|------|
| `--color-border-default` | `#1E3450` | Card borders, section dividers, table rows |
| `--color-border-light` | `#2A4060` | Hover borders, subtle separators |
| `--color-border-strong` | `#2A4060` | Emphasized borders, NavBar bottom, dividers that need more presence |
| `--color-border-focus` | `#0077B6` | Input focus borders |
| `--color-border-error` | `#FF6B6B` | Input error borders |

#### Rank Colors

Specific palette for the top-5 ranking system:

| Rank | Label | Color | Subtle BG |
|------|-------|-------|-----------|
| 1st | Gold | `#FFD700` | `rgba(255,215,0,0.15)` |
| 2nd | Silver | `#C0C0C0` | `rgba(192,192,192,0.15)` |
| 3rd | Bronze | `#CD7F32` | `rgba(205,127,50,0.15)` |
| 4th | -- | `#8899AA` | `rgba(136,153,170,0.10)` |
| 5th | -- | `#8899AA` | `rgba(136,153,170,0.10)` |

#### Source Tag Colors

For music data source indicators:

| Source | Color | Subtle BG |
|--------|-------|-----------|
| Spotify | `#1DB954` | `rgba(29,185,84,0.15)` |
| MusicBrainz | `#EB743B` | `rgba(235,116,59,0.15)` |

#### Light Mode Considerations

**Recommendation: Do not build a light mode at this time.** Rationale:
1. The dark theme is foundational to the brand identity -- it creates the "concert stage" atmosphere.
2. Artist imagery (often dark, moody, high-contrast) looks significantly better on dark backgrounds.
3. The user base (18-35 music fans) strongly trends toward dark-mode preference.
4. Engineering effort would double for every component without clear user demand.

If light mode is revisited in the future, the token architecture above supports it by swapping the `--color-bg-*` and `--color-text-*` groups under a `[data-theme="light"]` selector.

---

### 2.2 Typography

#### Font Stack

```
Primary:  "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif
Display:  "Montserrat", "Inter", sans-serif  (used for NavBar logo and display headings only)
Mono:     "JetBrains Mono", "Fira Code", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace
```

Inter is the workhorse for all UI text. Montserrat is reserved for the logo and marketing/hero headings where extra geometric boldness is desired. The mono stack is for code snippets, invite codes, and technical data.

#### Type Scale

All sizes use a modular scale with a ~1.25 ratio. Mobile sizes reduce by approximately one step.

| Level | CSS Class | Desktop | Mobile (<768px) | Weight | Line Height | Letter Spacing | Usage |
|-------|-----------|---------|-----------------|--------|-------------|----------------|-------|
| **Display** | `.text-display` | 48px | 36px | 900 | 1.1 | -0.03em | Hero sections, marketing pages, landing |
| **Page Title** | `.text-page-title` | 32px | 26px | 800 | 1.2 | -0.02em | Page headings (Feed, Profile, Admin Dashboard) |
| **Section Header** | `.text-section-header` | 24px | 20px | 700 | 1.3 | -0.01em | Section titles within pages (Favorite Artists, Following) |
| **Card Title** | `.text-card-title` | 18px | 16px | 700 | 1.35 | 0 | Artist name on card, post author, stat card label |
| **Body** | `.text-body` | 16px | 16px | 400 | 1.5 | 0 | Primary body text, post content, descriptions |
| **Body Small** | `.text-body-sm` | 14px | 14px | 400 | 1.5 | 0 | Secondary text, input text, captions |
| **Caption** | `.text-caption` | 12px | 12px | 400 | 1.4 | 0.01em | Timestamps, helper text, table headers |
| **Badge/Label** | `.text-badge` | 11px | 11px | 600 | 1.2 | 0.06em | Badge text, post type badges, status badges |
| **Overline** | `.text-overline` | 11px | 10px | 600 | 1.4 | 0.12em | Category labels, uppercase section eyebrows |

#### Usage Guidelines

- **Display**: Only for hero/marketing contexts. Never inside the app chrome. Font-family: Montserrat.
- **Page Title**: One per page, at the top. Pairs with `--color-text-bright`.
- **Section Header**: Used for card headers (`sectionHeader` in ProfilePage), modal section titles. Pairs with `--color-text-bright`.
- **Card Title**: Artist names, usernames in post headers. Pairs with `--color-text-bright` or `--color-text-primary`.
- **Body**: Default reading text. All post content, descriptions, paragraphs. Pairs with `--color-text-primary`.
- **Body Small**: Input placeholder/value text, secondary descriptions, album names, caption text below images. Pairs with `--color-text-primary` or `--color-text-secondary`.
- **Caption**: Timestamps (e.g., "2 hours ago"), table column headers, footer text. Pairs with `--color-text-secondary`.
- **Badge/Label**: Text inside badges and tags. Always `text-transform: uppercase`. Pairs with the badge's text color.
- **Overline**: Used above sections as a category label (e.g., "UPCOMING RELEASES"). Always `text-transform: uppercase`.

#### Responsive Behavior

At the `768px` breakpoint, Display/PageTitle/SectionHeader/CardTitle step down in size. Body and below remain constant -- 16px is the minimum comfortable reading size on mobile. This is handled via a single media query block in the token CSS.

---

### 2.3 Spacing

#### Base Unit: 8px

The spacing scale uses an 8px base with a half-step (4px) for micro-adjustments. Every spacing decision should reference one of these values.

| Token | Value | Semantic Name | Usage |
|-------|-------|---------------|-------|
| `--space-1` | `4px` | space-xs | Inner padding of badges, gap between icon and text, micro-adjustments |
| `--space-2` | `8px` | space-sm | Gap between badge and delete button, inner input icon padding |
| `--space-3` | `12px` | space-md | Card inner padding (compact), gap between list items |
| `--space-4` | `16px` | space-base | Default card padding, input padding, gap between sections on mobile |
| `--space-5` | `20px` | space-lg | Grid gap between cards, gap between form groups |
| `--space-6` | `24px` | space-xl | Section padding, gap between content blocks |
| `--space-8` | `32px` | space-2xl | Page section margins, large card padding |
| `--space-10` | `40px` | -- | Admin stat card padding, hero section padding |
| `--space-12` | `48px` | space-3xl | Page-level padding, modal padding |
| `--space-16` | `64px` | -- | Large section separation, page header bottom margin |
| `--space-24` | `96px` | -- | Hero section vertical padding, marketing page spacing |

#### Semantic Spacing Aliases

These named tokens map to the scale above for common patterns:

| Token | Maps To | Usage |
|-------|---------|-------|
| `--space-inset-card` | `16px` (`--space-4`) | Padding inside standard cards |
| `--space-inset-card-lg` | `24px` (`--space-6`) | Padding inside section containers (ProfilePage sections) |
| `--space-inset-input` | `12px` (`--space-3`) | Padding inside input fields |
| `--space-inset-badge` | `4px 8px` | Padding inside badges (vertical horizontal) |
| `--space-inset-button-sm` | `6px 16px` | Small button padding |
| `--space-inset-button-md` | `12px 24px` | Medium button padding |
| `--space-inset-button-lg` | `14px 32px` | Large button padding |
| `--space-stack-section` | `24px` (`--space-6`) | Bottom margin between sections |
| `--space-gap-card-grid` | `20px` (`--space-5`) | Gap between cards in a grid |
| `--space-gap-list-items` | `12px` (`--space-3`) | Gap between items in a vertical list |

---

### 2.4 Layout Grid

#### Breakpoints

| Name | Token | Min Width | Columns | Margin | Gutter |
|------|-------|-----------|---------|--------|--------|
| Mobile | `--bp-sm` | 0px | 4 | 16px | 16px |
| Tablet | `--bp-md` | 768px | 8 | 24px | 20px |
| Desktop | `--bp-lg` | 1024px | 12 | 32px | 24px |
| Wide | `--bp-xl` | 1280px | 12 | auto (centered) | 24px |

#### Max Widths

| Context | Max Width | Token |
|---------|-----------|-------|
| App shell | `1400px` | `--max-width-app` |
| Content (feed, auth) | `600px` | `--max-width-content` |
| Profile page | `1200px` | `--max-width-profile` |
| Admin dashboard | `1200px` | `--max-width-admin` |
| Auth card | `400px` | `--max-width-auth` |

#### Artist Card Grid

The main homepage artist list currently uses a horizontal scroll with fixed-width cards (220px min). For grid-based browsing views:

| Breakpoint | Columns | Card Min Width | Behavior |
|------------|---------|----------------|----------|
| 0 - 479px | 1 | 100% (full width) | Single column stack |
| 480 - 767px | 2 | ~200px | Two-column grid |
| 768 - 1023px | 3 | ~220px | Three-column grid |
| 1024 - 1279px | 4 | ~240px | Four-column grid |
| 1280px+ | 5 | ~240px | Five-column with auto-fill |

```css
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-5); /* 20px */
  padding: var(--space-6); /* 24px */
}
```

#### Profile Two-Column Layout

```
Desktop (>768px):  [Main Content: 1fr] [24px gap] [Sidebar: 300px]
Mobile  (<=768px): [Full Width: 1fr] (sidebar stacks below)
```

- Main column: avatar section, favorite artists, create artist form
- Sidebar: sticky at `top: 80px` (below nav), following list, quick follow

#### Feed Single-Column Layout

```
All breakpoints: [Feed Container: max-width 600px, centered]
```

- Post creator at top
- Posts stacked with 16px gap
- No sidebar

#### Admin Dashboard Grid

```css
.admin-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-5); /* 20px */
}
```

| Breakpoint | Stat Cards Per Row |
|------------|--------------------|
| 0 - 549px | 1 |
| 550 - 799px | 2 |
| 800px+ | 3-4 (auto-fit) |

#### Upcoming Music Grid

```css
.upcoming-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: var(--space-6); /* 28px - matching current */
}
```

Compact cards with small album art -- this remains dense by design.

---

## 3. Components

### 3.1 ArtistCard

The primary unit for displaying an artist in the browsable grid/list. Currently exists in two forms: a compact card (`ArtistCard.module.css`) and an image-dominant card in the horizontal scroll (`RapperList.css`). This spec unifies and formalizes both.

#### Anatomy

```
+------------------------------------------+
|  [Artist Image (3:4 aspect ratio)]       |
|                                          |
|  +----- Content Overlay (on hover) -----+|
|  | Artist Name (Card Title)             ||
|  | Genre Tag  |  Location               ||
|  | ------------------------------------ ||
|  | Clout: 42  |  [Vote Button]          ||
|  +--------------------------------------+|
+------------------------------------------+
   [Rank Label] (below card, top 5 only)
```

#### Specs

| Property | Value |
|----------|-------|
| Min width | `220px` |
| Aspect ratio | `3:4` |
| Border radius | `var(--radius)` = 8px |
| Background | `var(--color-bg-card)` |
| Border | `1px solid var(--color-border-default)` |
| Shadow (default) | `var(--shadow-md)` |
| Image | Full-bleed, `object-fit: cover`, fills entire card |
| Content overlay | Gradient: `linear-gradient(to top, rgba(11,22,34,0.9) 0%, rgba(0,119,182,0.2) 50%, transparent 100%)` |
| Content overlay opacity | `0` default, `1` on hover |
| Transition | `transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease` |

**Genre Tag** (inside overlay):
- Background: `var(--color-violet-subtle)` (default) or cycle through secondary accents
- Text color: `var(--color-violet)` or matching accent
- Padding: `4px 8px`
- Border radius: `4px`
- Font: `--text-badge` (11px, 600 weight, uppercase)

**Location Text**:
- Font: `--text-caption` (12px)
- Color: `var(--color-text-secondary)`

**Clout Display**:
- Font: 1.2em, bold
- Color: `var(--color-accent-light)`
- Text shadow: `1px 1px 2px rgba(0,0,0,0.8)` (for legibility on images)

**Rank Label** (positioned below card, only for positions 1-5 in main list):
- Font: `--text-body` (16px), weight 800, uppercase
- 1st: color `#FFD700`, 2nd: `#C0C0C0`, 3rd: `#CD7F32`, 4th-5th: `var(--color-accent-light)`
- Letter spacing: `0.05em`
- Margin top: `8px`

#### States

| State | Visual Change |
|-------|---------------|
| **Default** | Card visible, overlay hidden (opacity 0), shadow-md |
| **Hover** | `translateY(-4px)`, shadow-lg, overlay fades to opacity 1, image scales to 1.05 |
| **Active/Pressed** | `translateY(-2px)`, shadow-md (slightly pulled back from hover) |
| **Loading (Skeleton)** | Card shape maintained, shimmer animation on image area and 2 text lines |

#### Loading Skeleton

```
+------------------------------------------+
|  [Shimmer block: 100% width, 3:4 ratio]  |
+------------------------------------------+
|  [Shimmer line: 60% width, 16px tall]    |
|  [Shimmer line: 40% width, 12px tall]    |
+------------------------------------------+
```

---

### 3.2 FeedPost

Three variants: Text, Image, Video. All share a common shell.

#### Common Shell Anatomy

```
+------------------------------------------+
| [Avatar 32px] Username     [Badge] [Del] |
|              Timestamp                    |
|------------------------------------------|
| [Content Area - varies by type]          |
+------------------------------------------+
```

#### Specs

| Property | Value |
|----------|-------|
| Background | `var(--color-bg-card)` |
| Border | `1px solid var(--color-border-default)` |
| Border radius | `var(--radius)` = 8px |
| Overflow | `hidden` |
| Transition | `transform 0.2s ease, box-shadow 0.2s ease` |

**Post Header:**
- Padding: `16px`
- Border bottom: `1px solid var(--color-border-default)`
- Username: `--text-body-sm` (14px), weight 500, `--color-text-primary`
- Timestamp: `--text-caption` (12px), `--color-text-secondary`
- Avatar: 32px circle, `border: 2px solid var(--color-accent-light)`

**Post Type Badge:**
- Font: `--text-badge` (11px, 600, uppercase)
- Letter spacing: `0.5px`
- Padding: `4px 8px`
- Border radius: `4px`
- Text variant colors: `--color-accent-light` on `--color-accent-subtle`
- Image variant colors: `--color-teal` on `--color-teal-subtle`
- Video variant colors: `--color-violet` on `--color-violet-subtle`

**Delete Button:**
- Padding: `4px 10px` (expand to `8px 12px` for mobile touch target)
- Border: `1px solid var(--color-error)`
- Color: `var(--color-error)`
- Border radius: `4px`
- Hover: bg `var(--color-error)`, color `#FFFFFF`
- Disabled: `opacity: 0.5`

#### Text Variant

```
+------- Header -------+
| [Text content block] |
| padding: 16px        |
| font: --text-body    |
| line-height: 1.5     |
| white-space: pre-wrap|
+-----------------------+
```

#### Image Variant

```
+------- Header -------+
| [Image: 100% width]  |
| (no max-height in    |
|  feed display)       |
|--- border-top -------|
| [Caption text: 14px] |
| padding: 16px        |
+-----------------------+
```

#### Video Variant

```
+------- Header -------+
| [16:9 Video Player]  |
| padding-top: 56.25%  |
| iframe/video fills   |
|--- border-top -------|
| [Caption text: 14px] |
| padding: 16px        |
+-----------------------+
```

#### States

| State | Visual Change |
|-------|---------------|
| **Default** | Static card |
| **Hover** | `translateY(-2px)`, `box-shadow: var(--shadow-md)` |
| **Deleting** | `opacity: 0.5`, delete button shows spinner, pointer-events none on content |

#### FeedPost Skeleton

```
+------------------------------------------+
| [Circle 32px] [Line 40% x 16px]         |
|               [Line 25% x 12px]         |
|------------------------------------------|
| [Block 100% x 60px]                     |
+------------------------------------------+
```

---

### 3.3 NavBar

#### Anatomy

```
Desktop (>= 768px):
+---------------------------------------------------------------+
| [Logo]     Home  Feed  Videos  Images  Profile     [Avatar] [Logout] |
+---------------------------------------------------------------+

Mobile (< 768px):
+---------------------------------------------------------------+
| [Logo]                                          [Hamburger]   |
+---------------------------------------------------------------+
| (Dropdown overlay when open)                                  |
| Home                                                          |
| Feed                                                          |
| Videos                                                        |
| Images                                                        |
| Profile                                                       |
| [Avatar] Username                                             |
| [Logout Button]                                               |
+---------------------------------------------------------------+
```

#### Specs

| Property | Value |
|----------|-------|
| Background | `var(--color-bg-surface)` |
| Border bottom | `2px solid var(--color-border-default)` |
| Padding | `16px 24px` |
| Position | `sticky`, `top: 0`, `z-index: 1000` |
| Backdrop filter | `blur(12px)` |
| Height | Auto (approximately 64px with content) |

**Logo:**
- Font: Montserrat, 900 weight, 1.6rem, letter-spacing: 0.02em
- Background: `var(--color-accent-gradient)`
- Color: `var(--color-text-bright)`
- Padding: `8px 20px`
- Border radius: `var(--radius-sm)` (4px)
- Hover: `box-shadow: var(--shadow-glow)`

**Nav Links:**
- Font: Montserrat, 700 weight, 1rem
- Color (default): `var(--color-text-secondary)`
- Color (hover): `var(--color-text-bright)`
- Border bottom: `2px solid transparent` (default), `2px solid var(--color-accent-light)` (hover/active)
- Transition: `color 0.3s ease, border-bottom-color 0.3s ease`
- Gap between links: `40px` (desktop), `24px` (mobile stack)

**Active Tab:**
- Color: `var(--color-text-bright)`
- Border bottom: `2px solid var(--color-accent-light)`

**Nav Avatar:**
- Size: `32px x 32px`, circle
- Border: `2px solid var(--color-accent-light)`
- Hover: `box-shadow: var(--shadow-glow)`, `transform: scale(1.1)`

**Hamburger:**
- 3 bars: `30px x 3px`, color `var(--color-text-primary)`
- Gap: `6px`
- Active state: first bar rotates +45deg, middle fades, last rotates -45deg
- Transition: `all 0.3s ease`

**Mobile Menu:**
- Background: `var(--color-bg-surface)`
- Border bottom: `1px solid var(--color-border-default)`
- Padding: `32px 0`
- Animation: slide down (see Motion section)

#### States

| State | Visual Change |
|-------|---------------|
| **Logged out** | Show "Login" link in place of avatar/logout |
| **Logged in** | Avatar + username + logout button |
| **Admin** | Additional "Admin" link visible in nav list |
| **Mobile menu open** | Hamburger animates to X, dropdown visible |
| **Mobile menu closed** | Hamburger normal, dropdown hidden |

---

### 3.4 ProfileSection

#### Anatomy (Left Column)

```
+------------------------------------------+
| PROFILE INFO SECTION                     |
| [Avatar 100px]  Username                 |
|                 Role                     |
|                 [Upload Photo]           |
+------------------------------------------+

+------------------------------------------+
| FAVORITE ARTISTS (12/20)                 |
|------------------------------------------|
| [Search input: "Search artists..."]      |
| [Search results dropdown]               |
|------------------------------------------|
| Artist Name     [Clout: 42] [Remove]    |
| Artist Name     [Clout: 18] [Remove]    |
| Artist Name     [Clout: 7]  [Remove]    |
| ...                                      |
|------------------------------------------|
| (empty state if no favorites)            |
+------------------------------------------+

+------------------------------------------+
| CREATE ARTIST                            |
| [Name input]                             |
| [Genre input]                            |
| [Image URL input]                        |
| [Create Artist button]                   |
+------------------------------------------+
```

#### Section Container Specs

| Property | Value |
|----------|-------|
| Background | `var(--color-bg-card)` |
| Border | `1px solid var(--color-border-default)` |
| Border radius | `var(--radius)` = 8px |
| Padding | `24px 32px` |
| Hover | `box-shadow: var(--shadow-sm)` |

**Section Header:**
- Font: `--text-section-header` (24px, 600)
- Color: `var(--color-text-bright)`
- Margin bottom: `16px`
- Padding bottom: `12px`
- Border bottom: `1px solid var(--color-border-default)`

**Counter Badge** (e.g., "12/20"):
- Displayed inline with section header
- Font: `--text-badge` (11px, 600)
- Background: `var(--color-accent-subtle)`
- Color: `var(--color-accent-light)`
- Padding: `4px 10px`
- Border radius: `12px`
- When at limit (20/20): Background `var(--color-error)` at 15% opacity, color `var(--color-error)`

**Avatar Section:**
- Avatar wrapper: `100px x 100px`, circle, `border: 3px solid var(--color-border-default)`
- Image: `object-fit: cover`, fills wrapper
- Upload button: gradient primary button, small size
- Gap: `20px` between avatar and info

**Favorite Artist List Item:**
- Padding: `12px 0`
- Border bottom: `1px solid var(--color-border-default)` (except last)
- Layout: flex, space-between, center
- Name: `--text-body-sm` (14px), `--color-text-primary`
- Clout badge: `--text-caption` (12px), `--color-accent-light` on `--color-accent-subtle`, padding `4px 10px`, radius `12px`
- Remove button: `--text-caption` (12px), weight 600, `--color-error` on `rgba(220,53,69,0.15)`, radius `12px`
- Remove hover: background intensifies to `rgba(220,53,69,0.3)`

#### States

| State | Visual Change |
|-------|---------------|
| **Avatar uploading** | Upload button shows "Uploading..." text, disabled state, spinner icon |
| **List full (20/20)** | Counter badge turns red, search add buttons show "List Full" (disabled), no more additions |
| **Empty favorites** | Empty state component replaces list (see EmptyState spec) |
| **Search active** | Dropdown appears below search input with results |

---

### 3.5 SearchBar

Used in: HomePage (artist search), ProfilePage (favorite artist search).

#### Anatomy

```
+------------------------------------------+
| [Search Icon] Search artists...      [X] |
+------------------------------------------+
| Result 1 - Artist Name        [Add]     |
| Result 2 - Artist Name        [Added]   |
| Result 3 - Artist Name        [Add]     |
| No more results                          |
+------------------------------------------+
```

#### Specs

**Input:**
| Property | Value |
|----------|-------|
| Width | `100%` (constrained by parent, max `500px` on homepage) |
| Padding | `12px 16px` (`12px 16px 12px 40px` if search icon present) |
| Background | `var(--color-bg-input)` |
| Border | `1px solid var(--color-border-default)` |
| Border radius | `6px` (inner element radius) |
| Font | `--text-body` (16px) |
| Color | `var(--color-text-primary)` |
| Placeholder color | `var(--color-text-secondary)` |
| Transition | `var(--transition)` |

**Focus State:**
- Border color: `var(--color-border-focus)` = `var(--color-accent)`
- Box shadow: `0 0 0 3px var(--color-accent-glow)`
- Outline: none

**Dropdown:**
| Property | Value |
|----------|-------|
| Background | `var(--color-bg-card-elevated)` |
| Border | `1px solid var(--color-border-default)` |
| Border radius | `6px` |
| Max height | `200px` |
| Overflow | `auto` |
| Margin top | `8px` |
| Shadow | `var(--shadow-md)` |

**Result Item:**
- Padding: `12px 16px`
- Border bottom: `1px solid var(--color-border-default)` (except last)
- Hover: `background: var(--color-accent-subtle)`
- Layout: flex, space-between, center

**Add Button (in result):**
- Style: Primary gradient, small size (`6px 16px`)
- Text: "Add" (default), "Added" (disabled, already in list), "List Full" (disabled, at 20)
- "Added" state: `background: var(--color-success)` at 15% opacity, color `var(--color-success)`, no gradient
- "List Full" state: `opacity: 0.5`, no gradient, disabled

#### States

| State | Visual Change |
|-------|---------------|
| **Empty** | Placeholder text visible, no dropdown |
| **Typing** | Text appears, dropdown may not yet show (debounce pending) |
| **Loading** | Dropdown shows with skeleton lines (shimmer) |
| **Results** | Dropdown with artist names and action buttons |
| **No results** | Dropdown shows "No artists found" in `--color-text-secondary`, centered |

---

### 3.6 Buttons

#### Variants

**Primary (Gradient)**
| Property | Value |
|----------|-------|
| Background | `var(--color-accent-gradient)` |
| Color | `var(--color-text-bright)` |
| Border | `none` |
| Border radius | `var(--radius-pill)` = 500px |
| Font weight | 600-700 |
| Cursor | `pointer` |
| Transition | `box-shadow 0.3s ease, transform 0.3s ease` |

**Secondary (Outline)**
| Property | Value |
|----------|-------|
| Background | `transparent` |
| Color | `var(--color-accent-light)` |
| Border | `1px solid var(--color-accent)` |
| Border radius | `var(--radius-pill)` |
| Hover background | `var(--color-accent-subtle)` |

**Destructive (Red)**
| Property | Value |
|----------|-------|
| Background | `transparent` |
| Color | `var(--color-error)` |
| Border | `1px solid var(--color-error)` |
| Border radius | `4px` or `var(--radius-pill)` |
| Hover background | `var(--color-error)` |
| Hover color | `#FFFFFF` |

**Ghost (Text Only)**
| Property | Value |
|----------|-------|
| Background | `transparent` |
| Color | `var(--color-text-secondary)` |
| Border | `none` |
| Hover color | `var(--color-text-bright)` |
| Hover background | `rgba(255,255,255,0.05)` |

**Icon Button**
| Property | Value |
|----------|-------|
| Background | `transparent` |
| Color | `var(--color-text-secondary)` |
| Border | `none` |
| Width/Height | matches size (see below) |
| Border radius | `50%` |
| Hover | `background: rgba(255,255,255,0.08)`, color `var(--color-text-bright)` |

#### Sizes

| Size | Padding | Font Size | Min Height | Icon Size |
|------|---------|-----------|------------|-----------|
| **sm** | `6px 16px` | `13px` | `32px` | `16px` |
| **md** | `12px 24px` | `14px` | `40px` | `20px` |
| **lg** | `14px 32px` | `16px` | `48px` | `24px` |

#### States (All Variants)

| State | Primary | Secondary | Destructive | Ghost |
|-------|---------|-----------|-------------|-------|
| **Default** | Gradient bg | Transparent, accent border | Transparent, red border | Transparent |
| **Hover** | `shadow-glow`, `translateY(-2px)` | Accent subtle bg | Red bg, white text | Slight bg tint |
| **Active** | `translateY(-1px)`, shadow-sm | Border brightens | Darkened red bg | Slightly more bg tint |
| **Disabled** | `opacity: 0.5`, `cursor: not-allowed`, no hover | Same | Same | Same |
| **Loading** | Spinner replaces text, disabled styling | Same | Same | Same |

#### Loading Spinner (Inside Button)

- 16px spinner (sm), 18px (md), 20px (lg)
- `border: 2px solid rgba(255,255,255,0.3)`, `border-top-color: white`
- `animation: spin 0.6s linear infinite`
- Centered in button, text hidden but maintains width

---

### 3.7 Badges

#### Clout Badge

| Property | Value |
|----------|-------|
| Background | `var(--color-accent-subtle)` |
| Color | `var(--color-accent-light)` |
| Font | `--text-caption` (12px), weight 600 |
| Padding | `4px 10px` |
| Border radius | `12px` |
| Format | "Clout: {number}" or just the number |

#### Rank Badges

| Rank | Background | Text Color | Font Weight |
|------|------------|------------|-------------|
| 1st | `rgba(255,215,0,0.15)` | `#FFD700` | 800 |
| 2nd | `rgba(192,192,192,0.15)` | `#C0C0C0` | 800 |
| 3rd | `rgba(205,127,50,0.15)` | `#CD7F32` | 800 |
| 4th | `rgba(136,153,170,0.10)` | `#8899AA` | 700 |
| 5th | `rgba(136,153,170,0.10)` | `#8899AA` | 700 |

All rank badges: `--text-body` size, uppercase, `letter-spacing: 0.05em`.

#### Post Type Badges

| Type | Background | Text Color |
|------|------------|------------|
| Text | `var(--color-accent-subtle)` | `var(--color-accent-light)` |
| Image | `var(--color-teal-subtle)` | `var(--color-teal)` |
| Video | `var(--color-violet-subtle)` | `var(--color-violet)` |

All: `--text-badge` (11px, 600, uppercase), `letter-spacing: 0.5px`, `padding: 4px 8px`, `border-radius: 4px`.

#### Genre Tags

Genre tags should use a rotating set of subtle colors to provide visual variety without implying genre hierarchy:

| Rotation | Background | Text Color |
|----------|------------|------------|
| 1 | `var(--color-accent-subtle)` | `var(--color-accent-light)` |
| 2 | `var(--color-violet-subtle)` | `var(--color-violet)` |
| 3 | `var(--color-teal-subtle)` | `var(--color-teal)` |
| 4 | `var(--color-amber-subtle)` | `var(--color-amber)` |

Assignment: Use a hash of the genre string modulo 4 to pick a consistent color per genre name. This avoids hard-coding and ensures consistency.

Style: same as post type badges but with `border-radius: var(--radius-pill)` (500px) for a pill shape.

#### Source Tags

| Source | Background | Text Color | Icon |
|--------|------------|------------|------|
| Spotify | `rgba(29,185,84,0.15)` | `#1DB954` | Spotify icon (optional) |
| MusicBrainz | `rgba(235,116,59,0.15)` | `#EB743B` | MB icon (optional) |

Style: same dimensions as post type badges.

#### Status Badges (Admin)

| Status | Background | Text Color |
|--------|------------|------------|
| Pending | `rgba(255,179,71,0.15)` | `var(--color-warning)` |
| Approved | `rgba(0,230,118,0.15)` | `var(--color-success)` |
| Registered | `var(--color-accent-subtle)` | `var(--color-accent-light)` |

#### Sizes

| Size | Font Size | Padding | Border Radius |
|------|-----------|---------|---------------|
| **sm** | `10px` | `2px 6px` | `4px` (or pill) |
| **md** | `11px` | `4px 8px` | `4px` (or pill) |

---

### 3.8 Modal (Artist Detail)

#### Anatomy

```
+---- Overlay (full viewport) ----+
|                                  |
|  +---- Modal Card ----+         |
|  | [X Close]          |         |
|  |                    |         |
|  | [Image 120px] Artist Name   |
|  |               AKA           |
|  |               Genre | State |
|  |               Clout: 42     |
|  |                             |
|  | --- UPCOMING RELEASES ---   |
|  | [Album Art] Title   Date    |
|  | [Album Art] Title   Date    |
|  |                             |
|  | --- DISCOGRAPHY ---         |
|  | [Art] Album Name   Year  C  |
|  | [Art] Album Name   Year    |
|  | ...                         |
|  +-----------------------------+
|                                  |
+----------------------------------+
```

#### Specs

**Overlay:**
| Property | Value |
|----------|-------|
| Background | `var(--color-bg-overlay)` = `rgba(0,0,0,0.75)` |
| Position | `fixed`, `inset: 0` |
| Z-index | `1000` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Padding | `16px` (prevents edge-to-edge on mobile) |

**Modal Card:**
| Property | Value |
|----------|-------|
| Background | `var(--color-bg-surface)` |
| Border radius | `var(--radius)` = 8px |
| Max width | `500px` |
| Width | `100%` |
| Max height | `85vh` |
| Overflow-y | `auto` |
| Padding | `24px` |
| Shadow | `var(--shadow-lg)` |

**Close Button:**
- Position: absolute, `top: 12px`, `right: 12px`
- Background: none, border: none
- Color: `var(--color-text-secondary)`, hover: `var(--color-text-bright)`
- Font size: `1.8rem`
- Cursor: pointer
- Transition: `color 0.2s`

**Header:**
- Layout: flex, `gap: 16px`
- Artist image: `120px x 120px`, `border-radius: var(--radius)`, `object-fit: cover`
- Name: `--text-section-header` (24px, 600), `--color-text-bright`
- AKA: `--text-body-sm` (14px), italic, `--color-text-secondary`
- Details: `--text-body-sm` (14px), `--color-text-secondary`
- Clout: `--text-body-sm`, weight 700, `--color-accent-light`

**Section Headings** (Upcoming, Discography):
- Font: `--text-card-title` (18px, 600)
- Color: `--color-text-bright`
- Border bottom: `1px solid rgba(255,255,255,0.1)`
- Padding bottom: `8px`
- Margin bottom: `12px`

**Album Item:**
- Layout: flex, `gap: 12px`, wrap
- Album art: `48px x 48px`, `border-radius: 4px`
- Name: weight 600, `--color-text-bright`
- Year: `--color-text-secondary`, `--text-body-sm`
- Certification badge: `--text-badge`, `--color-amber` on `--color-amber-subtle`, pill shape

#### States

| State | Visual Change |
|-------|---------------|
| **Opening** | Overlay fades in (opacity 0 to 1, 200ms), card scales up (0.95 to 1, 200ms) |
| **Scrollable** | Content scrolls within max-height, scrollbar styled to match app |
| **Closing** | Reverse of opening: scale down + fade out |

---

### 3.9 Toast

Using react-toastify (already in dependencies). This defines the visual treatment.

#### Anatomy

```
+-----------------------------------------------+
| [Icon]  Message text here          [Dismiss X] |
|         [Optional action link]                 |
+-----------------------------------------------+
```

#### Specs

| Property | Value |
|----------|-------|
| Position | Bottom-right, `16px` from edges |
| Min width | `300px` |
| Max width | `420px` |
| Background | `var(--color-bg-card-elevated)` |
| Border radius | `var(--radius)` = 8px |
| Border left | `4px solid {variant color}` |
| Padding | `16px` |
| Shadow | `var(--shadow-lg)` |
| Font | `--text-body-sm` (14px) |
| Auto-dismiss | 4000ms (success/info), 6000ms (error/warning) |

#### Variants

| Variant | Left Border | Icon Color | Icon |
|---------|-------------|------------|------|
| Success | `var(--color-success)` | `var(--color-success)` | Checkmark circle |
| Error | `var(--color-error)` | `var(--color-error)` | X circle |
| Info | `var(--color-accent-light)` | `var(--color-accent-light)` | Info circle |
| Warning | `var(--color-warning)` | `var(--color-warning)` | Warning triangle |

**Message text:** `--color-text-primary`
**Action link (optional):** `--color-accent-light`, underline on hover, weight 600
**Dismiss X:** `--color-text-secondary`, hover `--color-text-bright`, `16px`

#### States

| State | Visual Change |
|-------|---------------|
| **Appear** | Slide in from right + fade in, 300ms ease-out |
| **Idle** | Progress bar at bottom (thin, variant color, shrinks over auto-dismiss duration) |
| **Hover** | Pauses auto-dismiss timer, progress bar pauses |
| **Dismiss** | Slide out to right + fade out, 200ms ease-in |

---

### 3.10 FollowButton

#### Anatomy

A single toggle button that cycles between Follow and Following states.

#### Specs

| State | Background | Color | Border | Text |
|-------|------------|-------|--------|------|
| **Follow** | `var(--color-accent-gradient)` | `var(--color-text-bright)` | `none` | "Follow" |
| **Following** | `transparent` | `var(--color-accent-light)` | `1px solid var(--color-accent)` | "Following" |
| **Following (hover)** | `rgba(255,107,107,0.12)` | `var(--color-error)` | `1px solid var(--color-error)` | "Unfollow" |
| **Loading** | Current state bg | -- | -- | Spinner replaces text |

| Property | Value |
|----------|-------|
| Size | md button (`12px 24px` padding) |
| Border radius | `var(--radius-pill)` |
| Font | `--text-body-sm` (14px), weight 600 |
| Transition | `all 0.2s ease-in-out` |

---

### 3.11 Cards

#### Stats Card (Admin Dashboard)

```
+------------------------------------------+
| Stat Label (overline)                    |
| 1,247                                    |
| ACTION HINT (caption)                    |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| Background | `var(--color-bg-card)` |
| Border | `1px solid var(--color-border-default)` |
| Border radius | `var(--radius)` |
| Padding | `30px` (current, map to `var(--space-8)` = 32px) |
| Text align | left |

**Stat Label:**
- Font: `--text-overline` (11px, 600, uppercase)
- Color: `var(--color-text-secondary)`
- Letter spacing: `1px`

**Stat Number:**
- Font: `48px` (desktop), `36px` (mobile), weight 800
- Color: `var(--color-text-bright)`
- Margin: `10px 0`

**Action Hint:**
- Font: `--text-caption` (12px, uppercase)
- Color: `var(--color-text-secondary)`
- Letter spacing: `1px`

**Interactive variant** (clickable cards):
- Cursor: `pointer`
- Hover: `translateY(-4px)`, `border-color: var(--color-accent)`, `box-shadow: var(--shadow-glow)`

#### Release Card (Upcoming Music)

```
+------------------+
| [Album Art]      |
| Release Title    |
| Artist Name      |
| Release Date     |
| [Source Badge]   |
+------------------+
```

| Property | Value |
|----------|-------|
| Background | `var(--color-bg-card)` |
| Border | `1px solid var(--color-border-default)` |
| Border radius | `var(--radius)` |
| Padding | `10px` |
| Shadow (default) | `var(--shadow-sm)` |

**Album Art:**
- Width: `100%`, `border-radius: 6px`
- Margin bottom: `6px`

**Release Title:** `--text-caption` (12px, 600), `--color-text-bright`
**Artist Name:** `10.4px` (0.65rem), `--color-text-secondary`
**Release Date:** `9.6px` (0.6rem), `--color-text-secondary`

Hover: `translateY(-4px)`, `shadow-md`, `bg-card-hover`

---

### 3.12 EmptyState

A reusable pattern for when a section has no content.

#### Anatomy

```
+------------------------------------------+
|              [Icon: 48px]                |
|           Headline text                  |
|     Description / helper text            |
|         [Optional CTA Button]            |
+------------------------------------------+
```

#### Specs

| Property | Value |
|----------|-------|
| Text align | center |
| Padding | `48px 24px` |
| Icon | `48px`, `--color-text-secondary` at 50% opacity |
| Headline | `--text-card-title` (18px, 600), `--color-text-primary` |
| Description | `--text-body-sm` (14px), `--color-text-secondary`, max-width `320px`, centered |
| CTA Button | Primary md button, `margin-top: 16px` |

#### Variants

| Context | Icon | Headline | Description | CTA |
|---------|------|----------|-------------|-----|
| No favorites | Heart outline | "No favorite artists yet" | "Search for artists and add up to 20 favorites to your list." | "Browse Artists" |
| No posts | Edit/pen outline | "No posts yet" | "Be the first to share something with the community." | "Create Post" |
| No followers | Users outline | "No followers yet" | "Share your profile and engage with the community to gain followers." | -- |
| No search results | Search outline | "No results found" | "Try a different search term or check your spelling." | -- |
| Feed empty | MessageSquare outline | "The feed is quiet" | "Follow more people or create a post to get things started." | "Explore" |

---

### 3.13 Skeleton

Animated loading placeholders that match the exact shape of the content they replace.

#### Shimmer Animation

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-element {
  background: linear-gradient(
    90deg,
    var(--color-border-default) 25%,
    var(--color-bg-card) 50%,
    var(--color-border-default) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

#### ArtistCard Skeleton

```
+------------------------------------------+
|  [Shimmer block: 100%, 3:4 aspect ratio] |
+------------------------------------------+
|  [Line: 65% x 16px, margin-top 8px]     |
|  [Line: 40% x 12px, margin-top 4px]     |
+------------------------------------------+
```

Card shell: same border/radius/padding as real card, but no hover effects.

#### FeedPost Skeleton

```
+------------------------------------------+
| [Circle 32px] [Line: 35% x 14px]        |
|               [Line: 20% x 10px]        |
|------------------------------------------|
| [Block: 100% x 180px]                   |
|                                          |
| [Line: 90% x 14px]                      |
| [Line: 60% x 14px]                      |
+------------------------------------------+
```

#### ProfileSection Skeleton

```
+------------------------------------------+
| [Circle 100px]  [Line: 40% x 20px]      |
|                 [Line: 25% x 14px]       |
|                 [Pill: 80px x 32px]      |
+------------------------------------------+
| [Line: 100% x 14px]                     |
| [Line: 100% x 14px]                     |
| [Line: 100% x 14px]                     |
+------------------------------------------+
```

---

### 3.14 Form Inputs

#### Text Input

| Property | Default | Focus | Error | Disabled |
|----------|---------|-------|-------|----------|
| Background | `var(--color-bg-input)` | Same | Same | `var(--color-bg-surface)` |
| Border | `1px solid var(--color-border-default)` | `1px solid var(--color-accent)` | `1px solid var(--color-error)` | `1px solid transparent` |
| Box shadow | none | `0 0 0 3px var(--color-accent-glow)` | `0 0 0 3px rgba(255,107,107,0.2)` | none |
| Color | `var(--color-text-primary)` | Same | Same | `var(--color-text-secondary)` |
| Cursor | text | text | text | `not-allowed` |
| Border radius | `6px` |
| Padding | `12px 16px` |
| Font | `--text-body-sm` (14px) or `--text-body` (16px) for prominent inputs |
| Placeholder | `var(--color-text-secondary)` |
| Transition | `border-color 0.2s ease, box-shadow 0.2s ease` |

**Error message** (below input):
- Font: `--text-caption` (12px)
- Color: `var(--color-error)`
- Margin top: `4px`

#### Textarea

Same as text input but:
- `resize: vertical`
- Min height: `80px` (3 lines)
- Default rows: 3

#### File Upload Button

```
+------------------------------------------+
|                                          |
|     Click or drag to upload [icon]       |
|     Accepted: JPG, PNG, GIF (max 5MB)   |
|                                          |
+------------------------------------------+
```

| Property | Value |
|----------|-------|
| Background | `var(--color-bg-input)` |
| Border | `2px dashed var(--color-border-default)` |
| Border radius | `6px` |
| Padding | `32px` |
| Text | `--text-body-sm`, `--color-text-secondary` |
| Hover border | `var(--color-accent)` |
| Active/drag-over | `background: var(--color-accent-subtle)`, `border-color: var(--color-accent)` |

#### Segmented Control (Post Type Toggle)

```
+--------+--------+--------+
|  Text  | Image  | Video  |
+--------+--------+--------+
```

| Property | Value |
|----------|-------|
| Container | flex, `gap: 8px` |
| Segment | `flex: 1`, `padding: 10px`, `border: 1px solid var(--color-border-default)`, `border-radius: 6px` |
| Default | bg `var(--color-bg-base)`, color `var(--color-text-secondary)` |
| Hover | `border-color: var(--color-text-secondary)` |
| Active/Selected | bg `var(--color-accent)`, color `var(--color-text-bright)`, `border-color: var(--color-accent)` |
| Font | `--text-body-sm` (14px) |
| Transition | `var(--transition)` |

---

## 4. Patterns

### 4.1 Artist Browsing

#### Grid Layout Behavior

1. **Initial load:** Show 20 artists in horizontal scrolling cards (current top-ranked view). Below: full grid view with pagination or infinite scroll.
2. **Grid:** `auto-fill, minmax(220px, 1fr)` with `20px` gap.
3. **Card interaction:** Click card to open ArtistDetail modal (not navigation).

#### Infinite Scroll

- **Trigger point:** When user scrolls within 300px of the bottom of the current list.
- **Loading indicator:** Append 4 skeleton cards at the bottom of the grid.
- **No more content:** Replace skeletons with a subtle message: "You've seen all artists" in `--text-body-sm`, `--color-text-secondary`, centered, padding `32px`.

#### Search-to-Filter Flow

1. User types in search bar (top of page).
2. After 300ms debounce, results appear in the dropdown.
3. Clicking a result opens the ArtistDetail modal directly.
4. The main grid below can optionally filter to show matching results (enhancement).
5. Clearing the search input restores the full list.

#### Clout Voting Interaction

1. User clicks "Clout" button on an artist card (inside the hover overlay).
2. **Optimistic update:** Clout count immediately increments by 1, button pulses with a brief scale animation (1 to 1.2 to 1, 300ms).
3. API call fires in background.
4. **On success:** No further visual change (already updated).
5. **On failure:** Revert count, show error toast "Vote failed. Try again."
6. **Rate limiting:** If user has already voted, button shows "Voted" (disabled state), different visual treatment (outline instead of gradient).

---

### 4.2 Feed Interaction

#### Post Creation Flow

1. User sees post creator card at top of feed.
2. **Type selection:** Segmented control with Text / Image / Video options. Default: Text.
3. **Content input:**
   - **Text:** Textarea with placeholder "What's on your mind?"
   - **Image:** File upload area appears. After selection, preview shows with "X" clear button. Optional caption textarea below.
   - **Video:** Sub-toggle for File Upload vs URL. URL input accepts YouTube links with live preview. File upload works like image.
4. **Submit:** Primary gradient button. Disabled until content exists. On click: button shows loading spinner, disabled.
5. **On success:** New post prepends to feed list with a brief fade-in (300ms). Post creator resets to empty. Success toast.
6. **On error:** Error message appears inside the creator card (red box). Button re-enables.

#### Feed Scroll

- Posts stack vertically, `16px` gap.
- Each post hovers on mouse-over (subtle lift).
- No infinite scroll currently (all posts loaded). If paginated in future, use same pattern as artist grid.

#### Delete Confirmation

1. User clicks "Delete" button on their post.
2. Button text changes to "Sure?" with same red styling (no modal dialog needed for lightweight deletion).
3. If clicked again within 3 seconds, post deletes with a fade-out animation (300ms, opacity to 0, then removed from DOM).
4. If 3 seconds pass without second click, button reverts to "Delete".
5. On successful deletion: optional success toast "Post deleted."

---

### 4.3 Profile Management

#### Avatar Upload Flow

1. User clicks "Upload Photo" button next to avatar.
2. Native file picker opens (hidden `<input type="file">`).
3. On file selection: button text changes to "Uploading...", disabled, with spinner.
4. Avatar image shows a subtle loading overlay (semi-transparent dark + spinner centered).
5. **On success:** New avatar replaces old one. Toast: "Profile photo updated."
6. **On error:** Old avatar remains. Toast (error): "Upload failed. Try again."
7. Avatar updates in NavBar simultaneously.

#### Search-to-Add Favorite Artist Flow

1. User types in the "Search artists..." input within the Favorite Artists section.
2. After 300ms debounce, dropdown appears with matching results.
3. Each result shows artist name and an "Add" button.
4. **Already in list:** "Add" button shows "Added" with success styling, disabled.
5. **List full (20/20):** All "Add" buttons show "List Full", disabled. Counter badge is red.
6. **On add click:** Optimistic update -- artist immediately appears in favorites list. Dropdown button changes to "Added". API call fires.
7. **On failure:** Remove artist from list, revert button, show error toast.
8. Dropdown closes when user clicks outside or clears input.

#### Remove Artist Flow

1. User clicks "Remove" button (red, small) next to a favorite artist.
2. Optimistic update: artist immediately removed from list with a slide-left fade-out (200ms).
3. Counter decrements (e.g., "12/20" to "11/20").
4. **On failure:** Artist reappears in list, error toast.

#### Counter Behavior at Limit

- Counter badge updates in real-time: "X/20".
- At 19/20: badge is normal blue.
- At 20/20: badge background switches to `rgba(255,107,107,0.15)`, text to `var(--color-error)`. A subtle pulse animation plays once.
- All "Add" buttons in search results become disabled.
- Attempting to search still works (user might want to browse), but adding is blocked.

---

### 4.4 Auth Flow

#### Sequence: Waitlist > Email Invite > Register > Login

```
[Landing/Waitlist Page]
   |
   | User submits email
   v
[Success: "You're on the list!" screen]
   |
   | Admin approves (generates invite code)
   | Email sent to user with invite code
   v
[Register Page]
   | Pre-filled email (from link) or manual entry
   | Invite code field
   | Password field
   | Submit
   v
[Login Page]
   | Email + password
   | Submit
   v
[Dashboard / Home]
```

#### Error States

| Page | Error | Display |
|------|-------|---------|
| Waitlist | Email already submitted | Error box: "This email is already on the waitlist." |
| Waitlist | Invalid email format | Error box: "Please enter a valid email address." |
| Register | Invalid invite code | Error box: "Invalid or expired invite code." |
| Register | Email already registered | Error box: "An account with this email already exists." |
| Register | Password too short | Error box: "Password must be at least 8 characters." |
| Login | Wrong credentials | Error box: "Invalid email or password." |
| Login | Account not found | Error box: "No account found with this email." |

Error box spec: `background: var(--color-error-subtle)`, `border: 1px solid var(--color-error)`, `color: var(--color-error)`, `padding: 12px`, `border-radius: var(--radius)`, `text-align: center`, `margin-bottom: 20px`.

#### Success States

| Page | Success | Display |
|------|---------|---------|
| Waitlist | Email submitted | Success box: "You're on the list! We'll email you when a spot opens up." |
| Register | Account created | Success box: "Account created! Redirecting to login..." (auto-redirect after 2s) |

Success box spec: `background: var(--color-success-subtle)`, `border: 1px solid var(--color-success)`, `color: var(--color-success)`, same dimensions as error box.

#### Auth Page Layout

- Full-viewport centered card on a gradient background: `linear-gradient(135deg, #0B1622 0%, #111D2E 50%, #0077B6 100%)`
- Card: `max-width: 400px`, `padding: 40px`, card bg, border, shadow-lg
- Title: `--text-section-header` (24px, 700), centered
- Subtitle: `--text-body-sm` (14px), `--color-text-secondary`, centered
- Footer: links to alternate auth page (e.g., "Already have an account? Log in"), `--text-body-sm`

---

### 4.5 Admin Patterns

#### Stats Overview Layout

- Grid of stat cards (`auto-fit, minmax(250px, 1fr)`)
- Each card shows: overline label, large number, optional action hint
- Interactive cards (e.g., "Total Artists") link to their respective management pages
- Non-interactive cards have no hover effects

#### Waitlist Table

```
+----------------------------------------------------------+
| EMAIL          | STATUS    | INVITE CODE  | ACTIONS      |
|----------------|-----------|--------------|--------------|
| user@email.com | Pending   | --           | [Approve]    |
| user@email.com | Approved  | ABC123 [Copy]| --           |
| user@email.com | Registered| ABC123       | --           |
+----------------------------------------------------------+
```

- Table header: `--text-caption`, uppercase, `--color-text-secondary`, `border-bottom: 2px solid var(--color-border-default)`
- Table cells: `padding: 12px`, `border-bottom: 1px solid var(--color-border-default)`, `--color-text-primary`
- Status column: uses Status Badge component
- Approve button: Primary small gradient button
- Copy button: Ghost icon button, `filter: grayscale(1)` default, `grayscale(0)` on hover

#### Approve Confirmation

1. Admin clicks "Approve" button.
2. Button immediately shows loading spinner.
3. **On success:** Row updates -- status badge changes from "Pending" to "Approved", invite code appears with copy button. Brief green flash on the row (background `var(--color-success-subtle)` for 1s, then fades).
4. **On error:** Button reverts, error toast.

#### Wipe/Reset Confirmation (Destructive)

For dangerous admin actions:
1. Admin clicks destructive action button.
2. A confirmation modal appears: "Are you sure? This action cannot be undone." with description of what will be affected.
3. Modal has two buttons: "Cancel" (secondary), "Confirm [Action]" (destructive).
4. The destructive button requires typing "CONFIRM" in a text input before it enables (for truly dangerous operations).
5. On confirm: loading state, then success/error handling.

---

## 5. Design Tokens (CSS Custom Properties)

The following is the complete `:root` block, organized by category, ready to replace the current `index.css` `:root` declaration.

```css
:root {
  /* ============================================
     9BY4 DESIGN TOKENS v1.0
     ============================================ */

  /* --------------------------------------------
     COLORS: BACKGROUND & SURFACES
     Ordered by elevation: base (lowest) to elevated (highest).
     Each step is ~6-8% lighter to create depth without harsh borders.
     -------------------------------------------- */
  --color-bg-base:          #0A1420;
  --color-bg-surface:       #0F1A2A;
  --color-bg-card:          #142030;
  --color-bg-card-hover:    #1A2C42;
  --color-bg-card-elevated: #1E3450;
  --color-bg-input:         #080F1A;
  --color-bg-overlay:       rgba(0, 0, 0, 0.82);

  /* --------------------------------------------
     COLORS: TEXT
     All pass WCAG AA contrast on card backgrounds.
     --color-text-primary on --color-bg-card (#142030) = ~10.5:1 (AAA).
     --color-text-secondary on --color-bg-card (#142030) = ~5.0:1 (AA).
     -------------------------------------------- */
  --color-text-primary:     #E0E6ED;
  --color-text-secondary:   #8899AA;
  --color-text-bright:      #FFFFFF;
  --color-text-disabled:    #556677;
  --color-text-inverse:     #0A1420;

  /* --------------------------------------------
     COLORS: PRIMARY ACCENT (Blue)
     The signature 9by4 blue. Used for primary actions,
     the brand logo, active states, and focus rings.
     -------------------------------------------- */
  --color-accent:           #0077B6;
  --color-accent-hover:     #005F92;
  --color-accent-active:    #004D77;
  --color-accent-light:     #00B4D8;
  --color-accent-subtle:    rgba(0, 119, 182, 0.15);
  --color-accent-glow:      rgba(0, 119, 182, 0.3);
  --color-accent-gradient:  linear-gradient(135deg, #0077B6, #00B4D8);

  /* --------------------------------------------
     COLORS: SECONDARY ACCENTS
     Genre-neutral colors for tags, badges, and data viz.
     Not tied to any specific genre or category.
     -------------------------------------------- */
  --color-violet:           #7C5CFC;
  --color-violet-hover:     #6A4AE0;
  --color-violet-subtle:    rgba(124, 92, 252, 0.15);

  --color-amber:            #F5A623;
  --color-amber-hover:      #D4901E;
  --color-amber-subtle:     rgba(245, 166, 35, 0.15);

  --color-teal:             #2DD4A8;
  --color-teal-hover:       #20B890;
  --color-teal-subtle:      rgba(45, 212, 168, 0.15);

  /* --------------------------------------------
     COLORS: SEMANTIC
     For feedback states: success, error, warning, info.
     Each has a solid color and a subtle background variant.
     -------------------------------------------- */
  --color-success:          #00E676;
  --color-success-subtle:   rgba(0, 230, 118, 0.12);
  --color-error:            #FF6B6B;
  --color-error-subtle:     rgba(255, 107, 107, 0.12);
  --color-warning:          #FFB347;
  --color-warning-subtle:   rgba(255, 179, 71, 0.12);
  --color-info:             #00B4D8;
  --color-info-subtle:      rgba(0, 180, 216, 0.12);

  /* --------------------------------------------
     COLORS: BORDERS
     -------------------------------------------- */
  --color-border-default:   #1E3450;
  --color-border-light:     #2A4060;
  --color-border-focus:     #0077B6;
  --color-border-error:     #FF6B6B;

  /* --------------------------------------------
     COLORS: RANK SYSTEM
     Used for top-5 artist rank badges and labels.
     -------------------------------------------- */
  --color-rank-1st:         #FFD700;
  --color-rank-1st-subtle:  rgba(255, 215, 0, 0.15);
  --color-rank-2nd:         #C0C0C0;
  --color-rank-2nd-subtle:  rgba(192, 192, 192, 0.15);
  --color-rank-3rd:         #CD7F32;
  --color-rank-3rd-subtle:  rgba(205, 127, 50, 0.15);
  --color-rank-neutral:     #8899AA;
  --color-rank-neutral-subtle: rgba(136, 153, 170, 0.10);

  /* --------------------------------------------
     COLORS: SOURCE TAGS
     For music data source indicators on release cards.
     -------------------------------------------- */
  --color-spotify:          #1DB954;
  --color-spotify-subtle:   rgba(29, 185, 84, 0.15);
  --color-musicbrainz:      #EB743B;
  --color-musicbrainz-subtle: rgba(235, 116, 59, 0.15);

  /* --------------------------------------------
     TYPOGRAPHY: FONT FAMILIES
     -------------------------------------------- */
  --font-primary:   "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
                    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
                    "Droid Sans", "Helvetica Neue", sans-serif;
  --font-display:   "Montserrat", "Inter", -apple-system, sans-serif;
  --font-mono:      "JetBrains Mono", "Fira Code", source-code-pro, Menlo,
                    Monaco, Consolas, "Courier New", monospace;

  /* --------------------------------------------
     TYPOGRAPHY: TYPE SCALE
     Desktop sizes. Mobile overrides via media query.
     Uses ~1.25 modular ratio.
     -------------------------------------------- */
  --text-display-size:          48px;
  --text-display-weight:        900;
  --text-display-line-height:   1.1;
  --text-display-letter-spacing: -0.03em;

  --text-page-title-size:       32px;
  --text-page-title-weight:     800;
  --text-page-title-line-height: 1.2;
  --text-page-title-letter-spacing: -0.02em;

  --text-section-header-size:   24px;
  --text-section-header-weight: 700;
  --text-section-header-line-height: 1.3;
  --text-section-header-letter-spacing: -0.01em;

  --text-card-title-size:       18px;
  --text-card-title-weight:     700;
  --text-card-title-line-height: 1.35;
  --text-card-title-letter-spacing: 0;

  --text-body-size:             16px;
  --text-body-weight:           400;
  --text-body-line-height:      1.5;
  --text-body-letter-spacing:   0;

  --text-body-sm-size:          14px;
  --text-body-sm-weight:        400;
  --text-body-sm-line-height:   1.5;
  --text-body-sm-letter-spacing: 0;

  --text-caption-size:          12px;
  --text-caption-weight:        400;
  --text-caption-line-height:   1.4;
  --text-caption-letter-spacing: 0.01em;

  --text-badge-size:            11px;
  --text-badge-weight:          600;
  --text-badge-line-height:     1.2;
  --text-badge-letter-spacing:  0.06em;

  --text-overline-size:         11px;
  --text-overline-weight:       600;
  --text-overline-line-height:  1.4;
  --text-overline-letter-spacing: 0.12em;

  /* --------------------------------------------
     SPACING
     8px base unit scale. Used for padding, margin, gap.
     -------------------------------------------- */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-24:  96px;

  /* Semantic spacing aliases */
  --space-inset-card:       16px;
  --space-inset-card-lg:    24px;
  --space-inset-input:      12px;
  --space-stack-section:    24px;
  --space-gap-card-grid:    20px;
  --space-gap-list-items:   12px;

  /* --------------------------------------------
     BORDER RADIUS
     Four-tier system: micro, inner elements, cards, buttons/pills.
     Sharper than v1.0 — precision, not softness.
     -------------------------------------------- */
  --radius-xs:    3px;
  --radius-sm:    4px;
  --radius:       8px;
  --radius-pill:  500px;

  /* --------------------------------------------
     SHADOWS
     Tighter, more defined elevation system (Raw & Premium).
     -------------------------------------------- */
  --shadow-sm:    0 1px 4px rgba(0, 0, 0, 0.4);
  --shadow-md:    0 2px 8px rgba(0, 0, 0, 0.5);
  --shadow-lg:    0 4px 16px rgba(0, 0, 0, 0.6);
  --shadow-glow:  0 0 12px rgba(0, 119, 182, 0.4);

  /* Inset shadows (cockpit controls) */
  --shadow-inset:       inset 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-inset-focus: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 0 2px var(--color-accent-glow);
  --shadow-sharp:       0 1px 2px rgba(0, 0, 0, 0.6);
  --shadow-focus-ring:  0 0 0 2px var(--color-accent-glow);

  /* Texture */
  --texture-noise-opacity: 0.025;

  /* --------------------------------------------
     TRANSITIONS & TIMING
     Standard easing and duration values.
     -------------------------------------------- */
  --transition:           all 0.2s ease-in-out;
  --transition-fast:      all 0.15s ease-in-out;
  --transition-normal:    all 0.2s ease-in-out;
  --transition-slow:      all 0.3s ease-in-out;
  --ease-default:         ease-in-out;
  --ease-bounce:          cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:          cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast:        150ms;
  --duration-normal:      200ms;
  --duration-slow:        300ms;
  --duration-modal:       200ms;
  --duration-toast:       300ms;

  /* --------------------------------------------
     LAYOUT
     Max widths, breakpoints (for reference in JS/media queries).
     -------------------------------------------- */
  --max-width-app:        1400px;
  --max-width-content:    600px;
  --max-width-profile:    1200px;
  --max-width-admin:      1200px;
  --max-width-auth:       400px;

  /* Breakpoints (for reference -- use in @media queries) */
  /* --bp-sm:   0px     */
  /* --bp-md:   768px   */
  /* --bp-lg:   1024px  */
  /* --bp-xl:   1280px  */

  /* --------------------------------------------
     Z-INDEX SCALE
     Predictable layering for overlapping elements.
     -------------------------------------------- */
  --z-base:       1;
  --z-dropdown:   100;
  --z-sticky:     200;
  --z-overlay:    500;
  --z-modal:      1000;
  --z-toast:      1100;
  --z-tooltip:    1200;

  /* ============================================
     LEGACY ALIASES
     Maps old token names to new ones for backward compatibility.
     Remove these after migrating all component CSS files.
     ============================================ */
  --bg-color:          var(--color-bg-base);
  --bg-surface:        var(--color-bg-surface);
  --card-bg:           var(--color-bg-card);
  --card-bg-hover:     var(--color-bg-card-hover);
  --card-bg-elevated:  var(--color-bg-card-elevated);
  --text-main:         var(--color-text-primary);
  --text-dim:          var(--color-text-secondary);
  --text-bright:       var(--color-text-bright);
  --accent:            var(--color-accent);
  --accent-hover:      var(--color-accent-hover);
  --accent-light:      var(--color-accent-light);
  --accent-glow:       var(--color-accent-glow);
  --accent-gradient:   var(--color-accent-gradient);
  --error:             var(--color-error);
  --success:           var(--color-success);
  --warning:           var(--color-warning);
  --border:            var(--color-border-default);
  --border-light:      var(--color-border-light);
  --radius:            var(--radius);
  --radius-pill:       var(--radius-pill);
  --shadow-sm:         var(--shadow-sm);
  --shadow-md:         var(--shadow-md);
  --shadow-lg:         var(--shadow-lg);
  --shadow-glow:       var(--shadow-glow);
  --transition:        var(--transition);
}

/* ============================================
   RESPONSIVE TYPOGRAPHY
   Reduce heading sizes on mobile.
   ============================================ */
@media (max-width: 767px) {
  :root {
    --text-display-size:        36px;
    --text-page-title-size:     26px;
    --text-section-header-size: 20px;
    --text-card-title-size:     16px;
    --text-overline-size:       10px;
  }
}
```

### Backward Compatibility Note

The `LEGACY ALIASES` section at the bottom maps every old token name (e.g., `--bg-color`, `--card-bg`, `--text-main`) to its new equivalent. This means **zero existing components will break** when you swap the `:root` block. The old names continue to resolve through `var()` references. Over time, migrate each component CSS file to use the new names directly, then remove the aliases.

---

## 6. Motion & Animation

### Philosophy

Motion on 9by4 serves three purposes:
1. **Feedback** -- confirming that an action was received (button press, vote cast).
2. **Orientation** -- helping users understand spatial relationships (modal opening from a card, toasts sliding in from the edge).
3. **Delight** -- small moments of craft that reward engagement (clout vote pulse, rank badge shimmer).

Motion should never delay the user. If an animation takes longer than 300ms, the content behind it must already be interactive.

### Reduced Motion

All animations must respect `prefers-reduced-motion: reduce`. When active:
- Replace all transforms/opacity animations with instant state changes.
- Keep color transitions (they don't cause motion sickness).
- Set all durations to `0ms`.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Timing Curves

| Name | Value | Use Case |
|------|-------|----------|
| `--ease-default` | `ease-in-out` | General transitions (hover, color changes) |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Page transitions, modal open/close, toast slide |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Clout vote pulse, playful micro-interactions |
| `ease-out` | (built-in) | Entrances (elements appearing) |
| `ease-in` | (built-in) | Exits (elements disappearing) |

### Duration Guidelines

| Duration | Token | Use Case |
|----------|-------|----------|
| 150ms | `--duration-fast` | Button active press, color change, small state toggles |
| 200ms | `--duration-normal` | Card hover lift, input focus ring, general transitions |
| 300ms | `--duration-slow` | Content overlay fade, image scale, page transitions |
| 200ms | `--duration-modal` | Modal open/close |
| 300ms | `--duration-toast` | Toast slide in/out |
| 1500ms | -- | Skeleton shimmer loop (non-interactive, ambient) |

### Specific Animation Specs

#### Card Hover

```css
.card {
  transition: transform var(--duration-slow) var(--ease-default),
              box-shadow var(--duration-slow) var(--ease-default),
              background-color var(--duration-normal) var(--ease-default);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  background-color: var(--color-bg-card-hover);
}

/* Artist card with image scale */
.artist-card-image {
  transition: transform var(--duration-slow) var(--ease-default);
}

.artist-card:hover .artist-card-image {
  transform: scale(1.05);
}

/* Content overlay fade */
.artist-card-overlay {
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-default);
}

.artist-card:hover .artist-card-overlay {
  opacity: 1;
}
```

#### Modal Open/Close

```css
/* Overlay */
.modal-overlay {
  opacity: 0;
  transition: opacity var(--duration-modal) var(--ease-smooth);
}

.modal-overlay.open {
  opacity: 1;
}

/* Modal card */
.modal-card {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
  transition: transform var(--duration-modal) var(--ease-smooth),
              opacity var(--duration-modal) var(--ease-smooth);
}

.modal-overlay.open .modal-card {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* Close: reverse */
.modal-overlay.closing .modal-card {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
```

#### Toast Appear/Dismiss

```css
/* Enter: slide from right + fade */
@keyframes toast-enter {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Exit: slide to right + fade */
@keyframes toast-exit {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast-enter {
  animation: toast-enter var(--duration-toast) var(--ease-smooth);
}

.toast-exit {
  animation: toast-exit var(--duration-normal) ease-in;
}
```

#### Button Press

```css
.button {
  transition: box-shadow var(--duration-slow) ease,
              transform var(--duration-slow) ease;
}

.button:hover:not(:disabled) {
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}

.button:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  transition-duration: var(--duration-fast);
}
```

#### Clout Vote Pulse

```css
@keyframes clout-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.clout-button.just-voted {
  animation: clout-pulse 300ms var(--ease-bounce);
}
```

#### Skeleton Shimmer

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border-default) 25%,
    var(--color-bg-card) 50%,
    var(--color-border-default) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

#### Page Transitions (Optional Enhancement)

If implementing route transitions (e.g., with React Transition Group):

```css
/* Enter */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-slow) var(--ease-smooth),
              transform var(--duration-slow) var(--ease-smooth);
}

/* Exit */
.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity var(--duration-normal) ease-in;
}
```

#### Hamburger Menu Animation

Already implemented, but formalized:

```css
.hamburger-bar {
  transition: all var(--duration-slow) ease;
}

/* Open state */
.hamburger-bar.active:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.hamburger-bar.active:nth-child(2) {
  opacity: 0;
}

.hamburger-bar.active:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}
```

#### FollowButton State Change

```css
.follow-button {
  transition: all var(--duration-normal) var(--ease-default);
}

/* Hover on "Following" shows "Unfollow" */
.follow-button.following:hover {
  background: rgba(255, 107, 107, 0.12);
  border-color: var(--color-error);
  color: var(--color-error);
  /* Text swap handled in JS/React */
}
```

#### Delete Fade Out

```css
@keyframes fade-out-left {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}

.post-deleting {
  animation: fade-out-left var(--duration-slow) ease-in forwards;
}

/* For favorite artist removal */
.fav-removing {
  animation: fade-out-left var(--duration-normal) ease-in forwards;
}
```

---

## Appendix: Migration Guide

### Adopting the New Token System

The design system is structured for incremental adoption:

1. **Phase 1 (Immediate):** Replace the `:root` block in `/src/index.css` with the tokens from Section 5. The legacy aliases ensure zero breakage. No other files need to change.

2. **Phase 2 (Component-by-component):** For each CSS module, replace old token references with new ones:
   - `var(--bg-color)` becomes `var(--color-bg-base)`
   - `var(--card-bg)` becomes `var(--color-bg-card)`
   - `var(--text-main)` becomes `var(--color-text-primary)`
   - `var(--text-dim)` becomes `var(--color-text-secondary)`
   - `var(--border)` becomes `var(--color-border-default)`
   - And so on for all legacy aliases.

3. **Phase 3 (Consolidation):** Replace hard-coded values with tokens:
   - Hard-coded `border-radius: 4px` or `8px` becomes `var(--radius-sm)` (6px)
   - Hard-coded `padding: 10px` becomes `var(--space-3)` (12px) or `var(--space-2)` (8px)
   - Hard-coded `font-size: 0.875rem` becomes referencing the type scale variables
   - Hard-coded `transition: all 0.3s ease` becomes `var(--transition-slow)`

4. **Phase 4 (Cleanup):** Once all components are migrated, remove the `LEGACY ALIASES` section from `:root`.

### Inconsistencies to Resolve

During the audit of existing CSS, these inconsistencies were identified for resolution during migration:

| Issue | Current | Target |
|-------|---------|--------|
| Mixed border-radius | `4px`, `6px`, `8px`, `12px` used interchangeably | `3px` (--radius-xs), `4px` (--radius-sm), `8px` (--radius), `500px` (--radius-pill) |
| Inconsistent input padding | `0.5rem`, `10px`, `12px`, `12px 16px` | `12px 16px` (standard), `12px` (compact) |
| Hard-coded colors in overlays | `rgba(108,99,255,...)` in modal upcoming section | Use token-based `var(--color-accent-subtle)` or new secondary accents |
| Duplicate skeleton keyframes | Defined separately in Feed, ImageFeed modules | Extract to shared utility or index.css |
| Montserrat loaded in NavBar | `@import` in component CSS | Move to index.html `<link>` or global CSS for single load point |
| Inconsistent variable names | Some files reference `--border-color`, `--text-color`, `--accent-color` (unused fallbacks) | Standardize to the new naming convention |

---

## Appendix: Shadows & Texture (v2.0)

### Shadow System

The "Raw & Premium" shadow system uses tighter, more defined shadows compared to v1.0. Shadows feel cast from a close light source, not ambient diffusion.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.4)` | Cards at rest, subtle elevation |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.5)` | Cards on hover, dropdowns |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.6)` | Modals, elevated panels |
| `--shadow-glow` | `0 0 12px rgba(0,119,182,0.4)` | Accent glow on hover (buttons, logo) |
| `--shadow-inset` | `inset 0 1px 3px rgba(0,0,0,0.4)` | Recessed inputs at rest (cockpit control feel) |
| `--shadow-inset-focus` | `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 0 2px var(--color-accent-glow)` | Recessed inputs on focus |
| `--shadow-sharp` | `0 1px 2px rgba(0,0,0,0.6)` | Micro-elevation for tags, badges |
| `--shadow-focus-ring` | `0 0 0 2px var(--color-accent-glow)` | Non-input focus rings (buttons, links) |

### Noise Texture

A subtle CSS-generated noise grain is applied via `body::after` at `--texture-noise-opacity: 0.025` (2.5%). This adds analog warmth without impacting performance or requiring an image asset. It uses an inline SVG `feTurbulence` filter.

- `pointer-events: none` ensures it doesn't block interaction
- `z-index: 9999` places it above all content as a visual overlay
- `position: fixed` prevents scroll interference

---

## Appendix: iOS Token Mapping (SwiftUI)

When building the 9by4 iOS app, map web tokens to SwiftUI equivalents:

### Colors

| Web Token | SwiftUI |
|-----------|---------|
| `--color-bg-base` (`#0A1420`) | `Color("bgBase")` or `Color(hex: 0x0A1420)` |
| `--color-bg-surface` (`#0F1A2A`) | `Color("bgSurface")` |
| `--color-bg-card` (`#142030`) | `Color("bgCard")` |
| `--color-bg-input` (`#080F1A`) | `Color("bgInput")` |
| `--color-accent` (`#0077B6`) | `Color.accentColor` (set in asset catalog) |
| `--color-accent-light` (`#00B4D8`) | `Color("accentLight")` |
| `--color-text-primary` (`#E0E6ED`) | `Color("textPrimary")` or `.primary` |
| `--color-text-secondary` (`#8899AA`) | `Color("textSecondary")` or `.secondary` |
| `--color-hot` (`#FF4D4D`) | `Color("hot")` |

### Typography

| Web Token | SwiftUI | Notes |
|-----------|---------|-------|
| `--font-primary` (Inter) | `.body` / SF Pro | iOS uses SF Pro as system font; Inter is the web equivalent |
| `--font-display` (Montserrat) | `.title.bold()` / SF Pro Display | Use SF Pro Display for headings |
| `--font-mono` (JetBrains Mono) | `.monospaced()` / SF Mono | System monospace |
| `--text-page-title-weight: 800` | `.font(.title).fontWeight(.heavy)` | |
| `--text-section-header-weight: 700` | `.font(.title2).fontWeight(.bold)` | |
| `--text-card-title-weight: 700` | `.font(.headline).fontWeight(.bold)` | |

### Shapes

| Web Token | SwiftUI |
|-----------|---------|
| `--radius-xs` (3px) | `RoundedRectangle(cornerRadius: 3)` |
| `--radius-sm` (4px) | `RoundedRectangle(cornerRadius: 4)` |
| `--radius` (8px) | `RoundedRectangle(cornerRadius: 8)` |
| `--radius-pill` (500px) | `Capsule()` |

### Shadows

| Web Token | SwiftUI |
|-----------|---------|
| `--shadow-sm` | `.shadow(color: .black.opacity(0.4), radius: 2, y: 1)` |
| `--shadow-md` | `.shadow(color: .black.opacity(0.5), radius: 4, y: 2)` |
| `--shadow-lg` | `.shadow(color: .black.opacity(0.6), radius: 8, y: 4)` |
| `--shadow-inset` | Use `Material` or custom `ZStack` with inner shadow view |
