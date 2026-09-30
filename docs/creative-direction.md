# Creative Direction — The Wolverine Hub

_Phase 0 Discovery · 2026-09-30 · Decisions locked 2026-09-30_

---

## 1. Concept: PRIMAL PRECISION

Raw, feral energy meets machine precision. Dark, cinematic base with white type; bursts of Wolverine yellow and blue, cut through with brand red; a brand-owned graphic device of **three parallel diagonal slashes** used for transitions, dividers, masks and the menu. Motion feels like tearing, snapping and locking into place: fast in, controlled settle.

**In one sentence:** A world-class fighter has primal instinct and precision technique — The Wolverine Hub is where you develop both.

---

## 2. Brand Personality

### 2.1 Voice Archetype: The Dark Coach
Authoritative. Cinematic. Quietly menacing. The Dark Coach doesn't shout — the best coaches never do. They state facts about your potential with total certainty. They believe in you harder than you believe in yourself, and that's what makes it intimidating.

> "This isn't a gym. It's where versions of you come to die — so better ones can be born."

Not aggressive for its own sake. Not bro-culture. Not hollow motivation-poster energy. **Real, earned, earned-the-hard-way intensity.**

### 2.2 Voice Qualities

| Quality | In practice |
|---|---|
| **Terse** | Short declarative sentences. "Train. Adapt. Evolve." No filler words. |
| **Earned authority** | Credentials implied, not stated. The writing assumes you'll do the work. |
| **Inclusive in a dark way** | "The pack" doesn't exclude — it tests. Anyone willing to show up belongs. |
| **Cinematic** | Visual, sensory language. "The bar bends. Your back doesn't." |
| **Occasional dry humour** | Knowing, never slapstick. Earns trust. |

### 2.3 What to Avoid
- Generic hype ("crush your goals", "beast mode", "no pain no gain")
- Toxic masculinity / body-shaming angles
- Excessive exclamation marks
- Corporate wellness-speak

---

## 3. Hero Headline Options

Three distinct tonal directions, each with a primary headline, sub-copy, and rationale.

---

### Option A — "FORGED HERE" (Concise + Mythic)

**Primary headline:**  
`FORGED HERE.`

**Sub-copy:**  
`The Wolverine Hub. Sri Lanka's most demanding training ground.`  
`Classes · Coaching · Programs — built for those who mean it.`

**Rationale:**  
Shortest possible statement with maximum resonance. "Forged" is metallurgical — intense heat + precise shaping — which maps perfectly to PRIMAL PRECISION. Implies transformation, permanence, and quality. No question whether you'll leave changed. Works visually as a single oversized word that can animate character by character.

---

### Option B — "WHERE IRON MEETS INSTINCT" (Duality + Brand Concept)

**Primary headline:**  
`WHERE IRON MEETS INSTINCT.`

**Sub-copy:**  
`Primal drives. Technical precision. One gym built to honour both.`  
`The Wolverine Hub, Colombo.`

**Rationale:**  
Names the PRIMAL PRECISION duality directly. "Iron" (equipment, discipline, will) meets "Instinct" (the feral, authentic drive beneath all training). More explanatory than Option A — a good choice if the brand needs to explain what kind of training this is. Strong visual: the slash between IRON and INSTINCT could be the brand's three-slash mark.

---

### Option C — "THE PACK IS CALLING." (Community + Aspiration)

**Primary headline:**  
`THE PACK IS CALLING.`

**Sub-copy:**  
`This is where serious people train. Where form is demanded and limits are personal records. Join the Wolverine Hub.`

**Rationale:**  
Community-first angle. Implies belonging, tribe, aspiration — you want to be called. Softer entry point than A or B but still carries weight. "The Pack" is scalable as a recurring brand phrase (Join the Pack, Pack Leader, Pack training). More inclusive; better for conversion-focused landing.

---

## 4. Tone of Voice in Practice

### Page examples

**Classes page intro:**  
"Twenty-four disciplines. Zero passengers. Every class is built around one idea: leave better than you arrived."

**Pricing page header:**  
"Pick your weapon. Every pass opens the same doors — the difference is how long you stay."

**Coaches section:**  
"Five coaches. Two hundred combined years of competitive experience. Zero interest in watching you do things wrong."

**Testimonials header:**  
"From first-timers to fighters. What the pack says."

**FAQ opener:**  
"Straight answers. We don't have time for vague."

**404 page:**  
"Rest day. This page doesn't exist — but your next session does."

**Intro sequence skip button:**  
"Skip the ceremony."

**Newsletter subscribe success:**  
"You're in the pack. Expect mail from people who mean it."

---

## 5. Motion Principles

### 5.1 Personality of movement
- **Fast in, controlled settle.** Entrances are snappy (50–100 ms easing out of a starting position); the element lands with a slight overshoot and settles. Never slow-fade in — that's corporate.
- **Tearing and slashing.** Clip-path reveals along diagonal axes. Elements don't fade — they rip open.
- **Weight.** Heavy elements move with inertia. A hero headline character doesn't float — it snaps and has aftershock.
- **Precision settle.** After the burst, everything is still. No lingering wobble. Primal + Precise.

### 5.2 Scroll behaviour
- ScrollSmoother on desktop only. Native on touch (no smoothTouch).
- Parallax only on large decorative elements (not text). Never scroll-jitter text.
- Pin sections: scroll chapter "From Zero to Beast" (home), horizontal class rail.
- Scroll velocity powers WebGL displacement and card skew — site feels alive under your hands.

### 5.3 Reduced motion
- `prefers-reduced-motion: reduce` → disable ScrollSmoother, WebGL, parallax, intro, autoplay video.
- Show static equivalents. Transitions become clean cross-fades.
- All content still fully accessible and readable.

---

## 6. Signature Visual Devices

### Three Parallel Diagonal Slashes
The brand's owned graphic device. Used as:
- Page transition wipe (red → blue → yellow panels)
- Section dividers (SVG, scalable, animated)
- Clip-path masks (slash-shaped image frames)
- Menu trigger icon (bars → slashes on hover → X when open)
- Loading indicator (three slashes animate in sequence)
- Texture in oversized background typography

The slashes always run at ~35° (consistent angle across all uses). Never used as decoration for its own sake — always functional (transition, mask, divider, or UI affordance).

### Grain Overlay
A fine film-grain texture (CSS noise or SVG feTurbulence) applied at 3–8% opacity over the entire viewport. Gives the site a cinematic, analog quality that no other gym site in this market uses. Applied via a `::before` pseudo-element on `<body>` that is pointer-events: none.

### Duotone Photography
Athlete photography processed with blue/yellow duotone treatment in CSS (`mix-blend-mode: color` overlay on a gradient). On hover, the duotone fades out to reveal full-color — reward for interaction.

### Oversized Outline Typography
Giant outline letterforms used as background texture in section backgrounds (e.g., "TRAIN" behind the schedule, "PRIMAL" behind the hero). These animate with a parallax offset on scroll.

---

## 7. Colour Application

| Context | Primary colour | Accent |
|---|---|---|
| Main backgrounds | `--twh-black` `--twh-ink` | `--twh-grey-100` borders |
| Primary body text | `--twh-white` | — |
| Primary CTA (button) | `--twh-yellow` bg + `--twh-black` text | `--twh-yellow` hover glow |
| Hover states / active items | `--twh-red` | — |
| Slash marks / dividers | `--twh-red` | — |
| Section bands (differentiation) | `--twh-blue` | `--twh-blue-deep` gradient |
| "Most popular" / featured badges | `--twh-yellow` | — |
| "Limited availability" badges | `--twh-red` | — |
| Form errors | `--twh-danger` (derived red, distinct) | — |
| Menu panels (tear sequence) | Red panel → Blue panel → Yellow panel | — |

**Never:** Yellow text on red background. Red text on blue background (contrast too low). Large blocks of red text on black.

---

## 8. Awwwards Self-Review Framework

At every design checkpoint, score against these four Awwwards criteria (1–10):

| Criterion | What we're judging |
|---|---|
| **Design** | Visual quality, typography, colour, spacing, photographic treatment |
| **Usability** | Navigation clarity, information architecture, accessibility, mobile experience |
| **Creativity** | Uniqueness of concept, interaction patterns, unexpected moments |
| **Content** | Quality of copy, CMS completeness, SEO, media quality |

**Target:** 8+ across all four at each checkpoint. If any criterion drops below 7, the phase does not move forward until resolved.

### Phase 0 self-review
| Criterion | Score | Notes |
|---|---|---|
| Design | N/A | Phase 0 is research only |
| Usability | N/A | |
| Creativity | 9/10 | PRIMAL PRECISION concept is original; slash device is ownable; no gym site executes at this level |
| Content | 8/10 | Reference analysis complete; tone-of-voice options strong; hero headlines solid. Pending: hero video direction, copywriting brief |

---

## 9. Menu — The Slash Menu

Full specification is in the master prompt (§3.3). Key creative principles:

- **Unique in this market.** No Sri Lankan gym site has a custom-animated navigation experience. This is not an enhancement — it's a signature.
- **Three alternative prototypes** will be built in Phase 6 for comparison [CHECKPOINT].
- The menu is the single element most likely to win a design award. Every transition, timing and easing must be considered.
- The right-side preview media panel (playing each nav item's clip through a slash-shaped mask) is a direct evolution of the Makahiya reference's product storytelling — but in motion, at award level.

---

## 10. Decisions (locked 2026-09-30)

| # | Question | Decision |
|---|---|---|
| 1 | Hero headline | **Option B — "WHERE IRON MEETS INSTINCT."** |
| 2 | Brand voice | **The Dark Coach** — confirmed |
| 3 | Hero video | **AI-generated video for dev phase; replace with real production video before go-live** |
| 4 | Sound toggle | **Off by default; hero video is always muted** |
| 5 | Konami code easter egg | **Pending — client to decide** (see note below) |

**Easter egg note:** The Konami code (↑↑↓↓←→←→BA) is a classic video game cheat code. If a user types it anywhere on the site, the three diagonal slash marks storm across the screen in red/yellow/blue. Invisible to most visitors — a reward for design-nerds. Entirely optional. Confirm to include or exclude before Phase 7.
