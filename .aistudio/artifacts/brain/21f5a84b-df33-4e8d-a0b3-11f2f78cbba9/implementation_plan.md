# VELT MEDIA — Static Site Development Server Setup

This plan resolves the development server startup failure by introducing a lightweight Node.js and Express HTTP server bound to `0.0.0.0:3000` to serve the existing VELT MEDIA portfolio application while keeping all original HTML, CSS, JavaScript, and media assets completely intact.

## User Review & Critical Decisions

> [!IMPORTANT]
> Click **Proceed** to execute this plan and immediately start the development server on port `3000`. All architectural and content preservation choices have been confirmed:

- **Confirmed Decision 1 (Server Architecture)**: Provision a lightweight Node.js and Express static web server listening on host `0.0.0.0` and port `3000` with complete `dev`, `build`, `start`, and `lint` scripts so the preview server boots immediately.
- **Confirmed Decision 2 (Content & Design Preservation)**: Keep all existing HTML structure, CSS styling, JavaScript animations, and page copy completely untouched.

---

## 1. Overview & Core Concept

- **What It Does**: Fixes the missing runtime configuration that prevented the development server from starting by adding an Express static server bound to `0.0.0.0:3000`, serving the VELT MEDIA post-production video editing agency portfolio website and all of its static assets.
- **Target Audience / Persona**: Prospective brand, automotive, commercial, and event clients browsing VELT MEDIA's services, sub-brands (`@MOTOFRAME.MOV`, `@TIMELINEFRAME.MOV`, `@EVERFRAME.MOV`), project gallery reels, and booking links.
- **Key Value**: Restores immediate live preview and development server execution on port `3000` with zero visual regression or alteration to the existing site.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Immediate Server Startup & Hero Experience**: Once the server starts on `0.0.0.0:3000`, visitors arrive on the full-viewport hero showcase featuring the VELT MEDIA brand lockup, headline reveal, and animated turnaround (`48H`) and on-time (`100%`) stat counters.
  2. **Service & Sub-Brand Exploration**: Visitors scroll through the three core service modules (Automotive, Commercial/Talking Content, Events/Weddings) with interactive 3D card tilt effects and direct links to the three specialized Instagram sub-brands.
  3. **Project Gallery & Team Showcase**: Visitors browse the bento-style project gallery featuring video reel thumbnails that link directly to Instagram Reels, followed by the continuous testimonial marquee and founder/core team profile cards.
  4. **Direct Booking & Contact Initiation**: Visitors initiate project inquiries via one-click WhatsApp booking links, pre-filled Gmail compose links, or Instagram profile links.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Dark cinematic post-production studio portfolio with high-contrast editorial typography and subtle red ambient lighting.
  - *Color Palette & Mood*: Preserve the existing custom CSS token palette (`--bg: #0b0b0b`, `--bg-soft: #111111`, `--card: #161616`, `--white: #ffffff`, `--grey: #cccccc`, `--red: #e50914`, and `--red-glow: rgba(229, 9, 20, 0.18)`).
  - *Typography & Hierarchy*: Geometric `Poppins` typeface across weights `300` to `900`, pairing bold uppercase section titles (`clamp(2rem, 5.5vw, 3.4rem)`) with tracked uppercase kickers.
  - *Component Styling & Layout*: Responsive `1240px` max-width container grid, asymmetrical bento gallery layout, glassmorphic fixed navigation header, and responsive mobile drawer navigation.
- **Interactive Feedback & Motion**:
  - Smooth GPU-accelerated cursor glow (`translate3d`) and interactive 3D card tilt on fine-pointer devices.
  - IntersectionObserver-driven stat number counters and active navigation section highlighting.
  - Scroll-triggered staggered section reveals powered by GSAP and ScrollTrigger with full `prefers-reduced-motion` fallback support.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Lightweight Express Static Server Bound to `0.0.0.0:3000`**
  - *Chosen Approach*: Configure a Node.js and Express static server listening on `0.0.0.0:3000` with npm lifecycle scripts (`dev`, `build`, `start`, and `lint`) and automatic dev server restart after installation.
  - *Why*: The repository was imported as a pure static HTML/CSS/JS site without a Node.js package manifest or server script, which caused the dev server not to start. Adding Express static serving resolves the startup failure immediately while preserving 100% of the original frontend.
  - *Alternatives Considered*: Migrating to a Vite or React SPA bundler was passed over per user preference to keep the static structure untouched.
- **Decision 2: Strict Non-Modification of Frontend Assets**
  - *Chosen Approach*: Leave all existing markup, styles, scripts, and media directories untouched while adding only the required runtime configuration and metadata files.
  - *Why*: Follows the confirmed user preference and migration guidelines to preserve existing design and functionality as-is.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Node.js + Express Runtime (0.0.0.0:3000)              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Static Asset Middleware & Catch-All Entry Route                   │  │
│  │  • Serves root HTML, CSS, client JS, and media asset directories  │  │
│  │  • Delivers main entry page for root and navigational requests    │  │
│  │  • Binds explicitly to host 0.0.0.0 on port 3000                  │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Client Browser Runtime (Vanilla JS)                 │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────┐  │
│  │ Navigation & Header  │  │ Viewport Observers   │  │ Pointer FX    │  │
│  │ • Scroll glass state │  │ • Active section spy │  │ • Cursor glow │  │
│  │ • Mobile menu drawer │  │ • Stat count-up      │  │ • 3D card tilt│  │
│  │ • Backdrop lock      │  │ • GSAP ScrollTrigger │  │   on hover    │  │
│  └──────────────────────┘  └──────────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - Stateless static delivery on the server side; all portfolio content, team profiles, and reel links are statically defined in the document markup.
  - Ephemeral client-side UI state managed in memory via DOM attributes and CSS classes (`scrolled` on the header, `nav--open` and `active` on mobile navigation, `no-scroll` on document body, and `gsap-ready` on the root element).
- **Interactive Component & State Mapping**:
  - **Express HTTP Listener (`0.0.0.0:3000`)**: Serves static files from the workspace root and responds with the main document entry point on `/` and fallback GET routes.
  - **Header Scroll Controller**: Listens to passive `scroll` events via `requestAnimationFrame` and toggles the `.scrolled` class when `window.scrollY > 40`.
  - **Mobile Navigation Drawer**: Toggles `.nav--open`, `.active`, `aria-expanded`, and `body.no-scroll` when clicking the hamburger toggle button, backdrop overlay, or any navigation link.
  - **Active Section Spy**: Uses `IntersectionObserver` across all `main section[id]` elements to highlight the corresponding `.nav__link` as the user scrolls.
  - **Animated Stat Counters**: Uses `IntersectionObserver` (`threshold: 0.6`) and cubic ease-out `requestAnimationFrame` interpolation to count up `data-count` metrics (`48H` and `100%`), with immediate static rendering when `prefers-reduced-motion` is enabled.
  - **3D Card Tilt & Cursor Glow**: Tracks `mousemove` coordinates via `requestAnimationFrame` on fine-pointer devices to update `--mx`, `--my`, and 3D rotation transforms on `.service-card` and `.branch-card` elements.
