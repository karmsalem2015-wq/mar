# AGENTS.md - Workspace Rules & Project Context

This folder is home. Treat it that way.

## Session Startup

Use runtime-provided startup context first.

## Memory

You wake up fresh each session. These files are your continuity:

- **Daily notes:** `memory/YYYY-MM-DD.md`
- **Long-term:** `MEMORY.md`

## Project Identity

This workspace is for the development of a **Premium Saudi Real-Estate Platform** (Next.js 14+ App Router, Tailwind CSS v4, Framer Motion, TypeScript, Sanity.io CMS, Supabase).
This platform represents a luxury digital experience reflecting the company's prestige, focusing on stability, trust, and first-class performance.

**Brand:** مار العقارية (MAR Real Estate)
**Website:** mar-ksa.com

## Visual & Stylistic Principles

Every agent working on this repository must adhere to the following design constraints:

1. **Curated Color Palette (Official MAR Real Estate Identity)**:
   - **Black**: Deep Black (`#121212` / `#000000`) for architectural typography, high-contrast headings, sharp outlines, and footer base.
   - **White**: Crisp Pure White (`#FFFFFF`) for cards, clean content containers, modals, and navbar.
   - **Cream / Soft Off-White**: Soft Gray & Warm Cream (`#F7F7F7`, `#F9F9F9`, `#FAF8F5`) for section alternates, search background, and subtle backdrops.
   - **Accent Blue**: Sky Blue (`#309EED`) & Deep Royal Blue (`#0073B6` / `#183F78`) for badges, active states, price tags, and primary CTAs.
   - **Harmonious Typography**: Primary font is **Cairo** for all Arabic text (headings, body, numbers) matching the official MAR identity.
2. **Generous White Space**: White space is an active design element
3. **RTL First**: Built for the Saudi Arabian market
4. **UI Engineering Playbook Mandatory**: All UI/UX work must adhere to [UI Playbook.md](UI%20Playbook.md)

## Motion Guidelines

- **Allowed**: Intersection-based entry, CountUp for stats, CSS shimmer on buttons, Slow testimonials marquee
- **Strictly Forbidden**: Floating particles, Neon glows, Custom mouse cursor, Endless spinner/bounce loops

## Technical Constraints

- Next.js App Router, Server Components by default
- `next/image` mandatory for all image loads
- Server Actions for all form submissions
- Error Boundaries for each page section

## Clean Code & Verification

- Total Security: Prevent SQL Injection, XSS, CSRF
- No hardcoded API keys or secrets
- Run `npm run build` before every change
- Clean up duplicates and linter warnings
