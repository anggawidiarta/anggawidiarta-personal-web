---
name: Angga Widiarta Portfolio
description: A dark, monumental one-page portfolio oversized condensed type in grey on near-black, hairline rules, outlined pills, and a single gold ink for interaction.
colors:
  ink: "#111111"
  boulder: "#808080"
  ash: "#aaaaaa"
  gold: "#f6c90e"
typography:
  display:
    fontFamily: "Bebas Neue, Impact, Arial Narrow, sans-serif"
    fontSize: "32.8rem"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.105em"
  headline:
    fontFamily: "Bebas Neue, Impact, Arial Narrow, sans-serif"
    fontSize: "16rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Open Sauce, Arial, sans-serif"
    fontSize: "max(24px, 3.2rem)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Open Sauce, Arial, sans-serif"
    fontSize: "max(16px, 1.6rem)"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "Open Sauce, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.3
  button:
    fontFamily: "Open Sauce, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  quote:
    fontFamily: "Georgia, Times New Roman, Times, serif"
    fontSize: "max(16px, 1.6rem)"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  pill: "45px"
  card: "1rem"
spacing:
  hairline: "2px"
  pill-y: "5px"
  pill-x: "8px"
  gutter: "4rem"
  gutter-phone: "1.6rem"
  block: "9.6rem"
components:
  button-pill:
    backgroundColor: "transparent"
    textColor: "{colors.ash}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
  button-pill-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
  nav-label:
    textColor: "{colors.boulder}"
    typography: "{typography.label}"
  list-row:
    textColor: "{colors.ash}"
    typography: "{typography.body}"
    padding: "16px 0"
  email-address:
    textColor: "{colors.ash}"
    typography: "{typography.title}"
  email-address-hover:
    textColor: "{colors.gold}"
  project-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ash}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "1rem"
---

# Design System: Angga Widiarta Portfolio

## Overview

**Creative North Star: "The Night Press"**

A pressroom after hours. The page is near-black paper, and the headlines are set so large that a single word fills the window: condensed Bebas Neue, mid-grey, pulled tight so the letters touch. Nothing competes with them. Information lives in small grey labels and hairline rules, and interaction is signalled by one gold ink that appears only when something can be acted on.

The system is flat and quiet at rest and alive under the pointer. Type moves (horizontal parallax, letters that lighten under the cursor, titles that slide up to reveal a gold copy of themselves) while surfaces never lift or glow. There are no cards, shadows or gradients on the page, and nothing animates for visitors who ask for reduced motion. Structure comes from 2px rules, generous black space, and the scale jump from monumental display type to 12px labels.

It rejects the usual developer-portfolio defaults: bright gradients, glassy cards, icon-plus-heading grids, and decorative illustration. Personality comes from scale and motion, not ornament.

**Key Characteristics:**

- Monumental condensed display type, grey on near-black, with letter-spacing pulled to touching.
- One accent, gold, reserved for hover, focus and selection.
- Flat everywhere: hairline rules and 2px pill outlines instead of shadows or cards.
- Two families only: Bebas Neue for display, Open Sauce for everything readable.
- Type-led motion: parallax, short slide-up reveals, a hover swap that reveals a gold copy of the text. All of it is switched off under `prefers-reduced-motion`.
- Reading text keeps a pixel floor (16px) even though the page's `rem` scales with the viewport.

## Colors

A four-value palette: one near-black ground, two greys that separate display from reading text, and one gold.

### Primary

- **Gold** (#f6c90e): the only chromatic colour. It appears on pill hover fills, hover swaps on project titles and the marquee, the email address on hover, keyboard focus rings, text selection, and the preloader bars. It never fills a resting surface and is never used for body text.

### Neutral

- **Ink** (#111111): the page ground, the preloader ground, and the text colour on gold fills. It is slightly lifted from pure black.
- **Boulder** (#808080): display type, hairline rules, pill outlines, and small labels (metadata, section labels, nav text). It was #777 and was lightened to reach 4.5:1 on Ink for 12px text.
- **Ash** (#aaaaaa): reading text, resting button text, list items, the email address, and the About paragraph. It is also the hover state for hero letters (Boulder to Ash).

### Named Rules

**The One Ink Rule.** Gold is the only colour on the page and it means "you can act on this". If gold appears on something non-interactive at rest, it is wrong.

**The Two Greys Rule.** Boulder is for display type and structure; Ash is for anything meant to be read. Never set a paragraph in Boulder, and never set a display word in Ash at rest (Ash is its hover state).

## Typography

**Display Font:** Bebas Neue (self-hosted via Fontsource, with Impact and Arial Narrow fallbacks)
**Body Font:** Open Sauce, weights 400 and 500 (self-hosted, with Arial fallback)
**Serif accent:** Georgia italic, used once, for the closing quote.

**Character:** A poster face against a quiet humanist sans. Bebas supplies volume and compression, Open Sauce supplies legibility at small sizes, and the two never mix inside a line.

### Hierarchy

- **Display** (400, 32.8rem which is 328px at 1440px, line-height 0.9, letter-spacing -0.105em on desktop and -0.05em on phones): the hero line "FULL —— STACK / DEVELOPER". On phones it is `min(160px, (100vw - 24px) / 3.05)` so "DEVELOPER" never breaks.
- **Headline** (400, 16rem which is 160px at 1440px, line-height 1, letter-spacing -0.025em, uppercase): the project titles. They run wider than the viewport on purpose and slide horizontally with scroll. 80px on phones.
- **Title** (500, max(24px, 3.2rem), line-height 1.3, letter-spacing -0.025em): the contact email address. 32px on phones.
- **Body** (400, max(16px, 1.6rem), line-height 1.3): list rows, the About paragraph (14px floor), pinned-card copy (14px floor). Prose paragraphs use line-height 1.4 to 1.45 and `text-wrap: pretty`.
- **Label** (400, 12px, line-height 1.3, uppercase, Boulder): the nav strip, project category/technology, section headings. Never smaller than 12px.
- **Button** (400, 16px, uppercase): pill labels.

### Named Rules

**The Pixel Floor Rule.** The page's root font-size is `100vw / 1440 * 10`, so `rem` shrinks with the window. That is correct for display type and wrong for reading text. Every reading role is `max(<px floor>, <rem value>)`: 16px for body, 14px for secondary copy, 12px for labels. Never size a reading role in bare `rem`.

**The Touching Letters Rule.** Display type is set with negative tracking so letters touch; the hero draws its letters as separate hoverable spans. Do not apply the same tracking to anything below display size (body stays at or above -0.025em).

## Layout

A single full-bleed column, `px-[4rem]` (1.6rem on phones), with 9.6rem between major blocks. Content is deliberately uneven: the nav strip is four groups spread edge to edge; project category labels sit in the right third; the contact email is centred; on phones everything left-aligns in a 255px right-shifted column.

Breakpoints (custom variants, max-width first): `tablet` ≤768px, `phone` ≤550px, `over-tablet` ≥769px, `over-phone` ≥551px, and `fine` for any fine pointer. Hover treatments are gated on `fine`; touch devices get tap feedback instead.

Rhythm is generous and asymmetrical: large black gaps between sections, tight leading inside text blocks, and more space above a section heading than below it. The Experience and Interests columns use `max(<rem>, <px>)` widths so they hold at the 16px floor on tablets.

## Elevation & Depth

Flat. The page has no shadows, gradients or glass. Depth comes from scale (the display type dwarfs everything), from 2px hairline rules in Boulder, and from motion (parallax and slide reveals).

### Named Rules

**The Flat-At-Rest Rule.** Nothing on the page casts a shadow or glows at rest. Interaction is shown by colour (Gold) and movement, never by lifting a surface.

## Shapes

Two shapes only. **Pills** (45px radius, 2px Boulder outline) for every button and link chip. **Hairlines** (2px Boulder rules, drawn from one edge on scroll) for structure. There are no other containers: lists are items divided by 2px top borders, not boxes.

## Components

### Buttons (pills)

- **Shape:** fully rounded pill (45px), 2px Boulder outline, padding 5px 8px, 16px uppercase.
- **Resting:** transparent fill, Ash text.
- **Hover (fine pointers):** fill and outline become Gold, text becomes Ink at weight 500, and the label rolls up to a duplicate with an exponential ease-out (`cubic-bezier(0.25, 1, 0.5, 1)`, 300ms). Nothing in the system bounces or overshoots.
- **Focus:** 2px Gold outline, 3px offset (global `:focus-visible`).
- **Variants:** all links and buttons share this one style: nav Journal and Contact, "View site" and "View code", footer socials.

### Navigation strip

Four groups across the top: name, role and year, availability, then Journal and Contact pills. Labels are 12px uppercase Boulder. On phones the groups stack in the right column and the line breaks are removed.

### Project rows

A Boulder 2px rule drawn in from alternating sides, a right-aligned 12px index (`01 / 08`, with the year beneath when set) beside the category and technology label, then the Headline-size title. The title is a link on every pointer; touch screens also keep the outlined "View site" / "View code" pill at every width. On a fine pointer, hovering the row slides a Gold copy of the title up through it (275ms ease); the label lightens from Boulder to Ash. Titles drift horizontally against scroll. On phones the title size follows the viewport (`min(80px, (100vw − 32px) / 5.5)`) so the longest word never breaks mid-word.

### List rows (Experience and Certifications)

Each row under a 2px Boulder top border with 16px vertical padding: the role or certificate name in Body Ash, the organization or issuer and year beneath in a 12px uppercase Boulder label, and an optional period right-aligned in 12px tabular figures. A certification with a credential link becomes a link row with a drawn Boulder arrow (stroke 2, round) that turns Gold, with the name, on hover. Rows rise 20px and fade in once as they enter view (0.9s).

### Contact block

A full-width marquee of Headline-size Boulder text linking to a prefilled `mailto:`; hovering rolls a Gold copy up through it and pauses the scroll. Beneath it, the email address (Title role) is a copy button; on hover or focus a small outlined "Click to copy" pill appears, and after a click it shows "Copied" for two seconds, on touch devices too. Below it, a standard "Write an email" pill opens the same prefilled `mailto:` on every device. There is no sound.

### Experience ledger

A "Work experience" 12px label, then ruled rows in the Journal's ledger pattern: each row opens with a 2px Boulder rule drawn in from alternating sides, then the role in Bebas `max(40px, 6.4rem)` (40px on phones), uppercase Boulder, and a right-aligned employer in Body Ash with the optional period beneath in 12px tabular figures. Rows are not links, so there is no Gold. On scroll each rule draws in and the role rises out of a mask (0.9s, exponential ease-out); the employer fades up. Certifications and Interests sit beneath as small reading lists (see List rows).

### Not found (404)

The Display word "404" in Boulder with the hero's dash drawn through it: a 2px-system hairline the weight of the hero dash, left to right, striking out the zero. Beside it, at the right like the hero's About, one line of Ash copy, the requested path as a 12px uppercase Boulder label (set by script, hidden without it), and two pills: Back home and Read the journal. The navigation, contact marquee and footer stay, so contact is still one step away. On load the digits rise from a mask, then the strike draws and the copy rises; all of it is off under `prefers-reduced-motion`. The page is `noindex`.

## Journal

The Journal (`/journal`, `/journal/[slug]`) is a Read surface inside the same world: the frame (masthead, titles, rules, pills) stays Night Press, the reading column stays calm.

- **Index (ledger):** a Display "JOURNAL" masthead, topic pills, the newest article as a lead (Headline-size title, 65ch excerpt), then ruled rows: number, title in Bebas `max(40px, 8rem)` (40px on phones) with the gold slide-up swap on hover, and a right-aligned 12px meta block. Rows and lines reuse the project-row rules and drawing motion.
- **Topic pills:** the standard pill; the selected pill (`aria-pressed`) takes the Gold fill, since it is an interactive state. Filtering reorders with a short Flip glide and respects reduced motion.
- **Article:** title in Headline size (64px on phones), Boulder, balanced. Body is Open Sauce 400 at `max(17px, 1.8rem)` and line-height 1.6, held to 68ch, in Ash. Section heads are Bebas in Boulder (`max(40px, 5.6rem)`) under a 2px rule; subheads are Open Sauce 500. Quotes use the Georgia italic accent. Links are Ash with a 2px Boulder underline that turns Gold on hover.
- **Code:** flat blocks between 2px Boulder rules with a 12px language label, set in the system monospace stack (the one functional exception to the two-family rule). Syntax is a grey ramp (#808080 comments up to #ffffff keywords); Gold never appears in code.
- **Contents and progress:** a sticky contents list in the left margin on wide screens, a collapsed "Contents" disclosure on tablets and phones. The current section is Ash; hover and focus are Gold. Reading progress is a 2px Ash hairline at the top of the page: it is feedback, not interaction, so it is not Gold.
- **Motion:** masthead letters and article title lines rise out of a mask once; nothing else on these pages animates on load. All of it is off under `prefers-reduced-motion`.

## Now Playing

A small colophon line under the name in the nav, fed by Spotify (`/api/now-playing`): a 12px uppercase status line, a 32px cover, title in Ash, artist in Boulder, and a 2px progress hairline.

- **States:** playing (three Ash equalizer bars move, progress runs), paused (bars rest low, "Paused"), recent ("Last played · 2 hours ago", Boulder dot-height bars, no progress). With no data it is removed; while loading it is invisible but keeps its space so the nav never jumps.
- **Colour:** the cover is greyscale at rest and takes its real colours on hover or focus, so the page keeps its single chromatic ink. The title turns Gold on hover and focus because the whole block is a link. Progress is feedback, so it stays Ash.
- **Motion:** the equalizer, plus one slide-up when the song changes while the page is open. Both are off under `prefers-reduced-motion`. No sound, ever.

## Studio

The private CMS (`/studio/*`) is an Operate surface in the same world: precision over expression, no intro motion, no analytics.

- **Forms:** a label above each field (12px uppercase Boulder), a 2px Boulder underline, and no box. Focus turns the underline and its label Gold together; the browser outline is removed on fields only because those two cues replace it. Autofill is repainted on the page ground. An invalid field takes an Ash underline and the message sits in an `alert` beside the action, never in a coloured box.
- **Sign in:** "Studio" in Headline size, one line of context, two fields, the standard pill. Errors say what to do (wrong credentials, wait, try later) and stay generic about which accounts exist. Show/Hide password and the Caps Lock hint appear only when JS runs.
- **Article list:** the same ruled rows as the project list: title in Open Sauce (not Bebas, since this is a working list), status as text ("Draft", "Published"), date right-aligned. Hover turns the title Gold on fine pointers.
- **Editor:** a sticky bar with the save state ("Saved", "Saving…", "Unsaved changes", errors with Retry) and the primary action; fields on the left, a live preview on the right in the article's own type (Bebas title, `.prose-press` body). Below 1100px the preview is a Write/Preview toggle whose selected state is Gold, like the topic pills. The Markdown textarea uses the system monospace stack, as code does elsewhere.
- **Section nav:** under the header, a ruled row of 12px uppercase links (Journal, Projects, Experience, Certifications, Social links, Profile & contact); the current one is Ash with a 2px Ash underline, hover is Gold. It scrolls sideways on phones. The header carries the publish state ("Unpublished changes" in Ash with a small dot, or "Site up to date" in Boulder) and the **Publish site** pill.
- **Content lists:** the article-list rows with the item in Open Sauce, a 12px meta line, and row actions as 12px text buttons (↑, ↓, Hide/Show); a hidden item drops to Boulder with a "Hidden" label. Forms reuse the field style; homepage edits never rebuild on their own.
- **Destructive action:** Delete is plain text; the first click turns it into "Confirm delete" for four seconds. There is no modal.
- **Never** in the Studio: Gold as a status colour, toasts, spinners over content, or colour as the only signal of state.

## Do's and Don'ts

### Do

- **Do** use Gold (#f6c90e) only for interactive states: hover fills, focus rings, selection, and the hover-swap copy of titles.
- **Do** set reading text with a pixel floor (`max(16px, 1.6rem)`), and keep labels at 12px or larger.
- **Do** keep display type in Bebas Neue, uppercase, in Boulder, with tight negative tracking.
- **Do** build structure from 2px Boulder hairlines and pill outlines, not boxes or shadows.
- **Do** gate hover-only treatments on `fine` and give touch users an equivalent (such as the "Copied" confirmation).
- **Do** keep one authored motion per section: parallax drift, slide-up reveal, or hover swap, not all at once.

### Don't

- **Don't** add shadows, gradients, glass or glow to resting surfaces, and never use easing that bounces or overshoots.
- **Don't** introduce a second chromatic colour or use Gold for decoration or body text.
- **Don't** set paragraphs in Boulder, justify narrow columns, or Title Case a sentence.
- **Don't** size reading text in bare `rem`; the page's `rem` collapses on tablets.
- **Don't** wrap content in cards or use icon-plus-heading grids. Lists are ruled rows.
- **Don't** add a third type family or mix Bebas into running text.
- **Don't** add an intro or loading screen, or any sound. The first paint is the hero.
