---
target: homepage portfolio
total_score: 18
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
target_identity: "file:E:\\Code\\my-project\\anggawidiarta-personal-portfolio\\src\\pages\\index.astro"
target_fingerprint: "sha256:8119face35c0092794f78c62a2ca57ca73d84a5dba3bae9f5ecc23e5186fdb49"
target_path: "E:\\Code\\my-project\\anggawidiarta-personal-portfolio\\src\\pages\\index.astro"
timestamp: 2026-10-22T07-25-08Z
slug: src-pages-index-astro
---

# Critique: Homepage (src/pages/index.astro)

Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score

| #     | Heuristic                       | Score       | Key issue                                                                                        |
| ----- | ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| 1     | Visibility of System Status     | 2           | Fixed 2s preloader; "Click To Copy" hint hidden on touch                                         |
| 2     | Match System / Real World       | 2           | "WEB DEVELOPMENT" ×5, "PORTFOLIO EXPLORATION" as tech, undated experience                        |
| 3     | User Control and Freedom        | 2           | Scroll hijack (lerp 0.06); project clicks intercepted + window.open after 150ms                  |
| 4     | Consistency and Standards       | 1           | 3D pin cards break DESIGN.md (shadow, cards, gold at rest); three different "contact" behaviours |
| 5     | Error Prevention                | 3           | Little to get wrong; prefilled mailto                                                            |
| 6     | Recognition Rather Than Recall  | 2           | Desktop project titles clipped; pin cards show no link affordance                                |
| 7     | Flexibility and Efficiency      | n/a         | Single-page portfolio                                                                            |
| 8     | Aesthetic and Minimalist Design | 2           | Strong top; ~4,000px of evidence-free titles + filler sections                                   |
| 9     | Error Recovery                  | 2           | "Copy failed" exists but no mailto fallback beside email                                         |
| 10    | Help and Documentation          | n/a         | Portfolio                                                                                        |
| Total |                                 | 18/32 (56%) | Acceptable                                                                                       |

## Design Specificity Verdict

Authored for a type specimen, not for Angga. The Night Press system (grey Bebas, 2px rules, single gold) is strong and non-template, but nothing beyond a 12px name says Angga, Lombok, backend or architecture. Biggest element carries the most generic phrase ("FULLSTACK DEVELOPER"); project list is a known Awwwards pattern holding only title + one framework; the 3D pin section is a pasted Aceternity demo that breaks DESIGN.md (shadow, cards, slate/zinc, gold titles at rest, AnimatedPinDemo.tsx:32).
Detector: 8 advisory findings. 6 in unused src/components/Card.astro (dead starter file); BaseLayout text-[1.6rem] false positive; bounce-easing in ButtonLabel.astro:11 (intentional pill style). Browser overlay: em-dash-overuse 22–23 (inflated by title separators duplicated for hover), heading-rhythm ×6 on phone (34px above / 52px below project titles). Detector-only: card images ~3× oversize as CSS backgrounds without alt/lazy/srcset; desktop horizontal overflow to 4138px from project titles.

## Priority Issues

- [P0] Fullstack/architecture claim has zero evidence: titles + one framework only; pin cards all UI/Figma; experience undated. Fix: 3 case-study rows (problem, role, backend stack, architecture note), dates + scope on experience, link projects to employers; real material only. Command: shape → clarify.
- [P1] Projects can't be opened on touch >550px (ProjectCard.astro:25 pointer-events none unless fine; ProjectLink.astro:13 over-phone:hidden); pin card links opacity-0 until hover, keyboard focuses invisible links. Fix: whole row as link everywhere; pin cards as real anchors with visible focus label. Command: harden → adapt.
- [P1] Motion/ceremony without reduced-motion: fixed 2s preloader, scroll hijack, parallax, marquee, 3D tilt, text-generate, click sounds; no prefers-reduced-motion anywhere. Fix: drop/cap preloader, remove sound, honour reduced-motion, native anchors, remove unused deps. Command: quieter → optimize.
- [P1] No identity/trust signals: no photo, no CV, no years; LinkedIn/GitHub footer-only with Instagram first; Blog in nav exits site. Fix: nav Resume · GitHub · LinkedIn · Contact; portrait + years + WITA/remote near About. Command: clarify → layout.
- [P2] Off-system showcase and filler: clip-art pin cards, Interests/Icebreakers/quote, 8 titles ≈4,000px on phone. Fix: cut or rebuild pin cards as "Design work"; merge filler into About; attribute or drop quote; 4–5 projects + "More on GitHub". Command: distill.

## Kurang / Berlebihan / Diperlukan

Kurang: photo/seniority; CV PDF; backend/architecture evidence; dated experience linked to projects; LinkedIn/GitHub above fold; availability details (remote, WITA, start); real social proof.
Berlebihan: 2s preloader; click sounds; 5–6 concurrent motion systems; clipped/oversized project titles; nav label repeating hero; 3D pin section; quote/Interests/Icebreakers; third-party clock widget; three contact behaviours.
Diperlukan: hero sub-line naming what he builds and for whom (user to confirm copy); 3 backend case-study blocks; dated timeline; single contact block (mailto + copy); working tablet/keyboard navigation; reduced-motion.

## Persona Red Flags

- Rina (technical recruiter): no years, employer, backend depth, CV or LinkedIn in first viewport; experience at ~60% depth; UI/Figma cards signal frontend/designer.
- Casey (mobile, slow): main.invisible until JS; ~7,200px to email; mailto only in moving marquee.
- Riley (stress tester): iPad can't open projects; tab to invisible pin links; delayed window.open may be popup-blocked; blocked clock script leaves empty footer link.
- Jordan (first-timer): 2s bars; truncated titles; nav "Contact" only scrolls.

## Minor Observations

Full legal name in nav vs "Angga Widiarta" elsewhere; delete Card.astro; card images ~3× oversize, peaks.jpg (114 KB) seemingly unused; Lombok link exits to travel blog near contact; "Created by" redundant; pin link lacks rel=noopener.

## Questions to Consider

- One 30-second artefact: this hero, or an architecture diagram of Mataram Medika / UMKM?
- What does 328px "FULL —— STACK" prove that only Angga can claim?
- Who are the 3D cards for; should they live on a separate Design page?
- Keep preloader and sound if median recruiter session is under 40 seconds?
