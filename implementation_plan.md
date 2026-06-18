# Buddies Cafe Tea Room — Multi-Page Luxury Ecosystem

Transform the existing single-page site into a **world-class, multi-page cinematic luxury website** with full e-commerce, rich storytelling, and 20+ pages.

## User Review Required

> [!IMPORTANT]
> This is a complete architectural overhaul. The existing single-page layout will be replaced with a React Router multi-page ecosystem. All current components will be refactored and significantly expanded. Please review the page list, tech decisions, and phased approach below.

> [!WARNING]
> Given the massive scope (20+ pages, 50+ components, 15+ product entries, 6 kombucha flavors, full cart/checkout/auth flows), I will build this in **3 phases** and deliver each phase for your review. This ensures quality over rushing.

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite (existing) | Already set up |
| Routing | `react-router-dom` | Multi-page SPA navigation |
| Animation | `framer-motion` (existing) | Premium scroll/page transitions |
| State | React Context API | Cart, Auth, Wishlist — no external state lib needed |
| Styling | Vanilla CSS (existing) | Full design control |
| Icons | `lucide-react` (existing) | Consistent icon system |
| Images | AI-generated via `generate_image` | High-quality cinematic assets |

---

## Phase 1 — Core Architecture & Homepage (This session)

Build the multi-page foundation and the rich, layered homepage.

### Router & Layout Shell

#### [NEW] src/context/CartContext.jsx
Global cart state (items, quantities, totals, GST, coupons).

#### [NEW] src/context/AuthContext.jsx
Simulated auth state (login/signup, account info).

#### [NEW] src/context/WishlistContext.jsx
Wishlist state (add/remove, persist in localStorage).

#### [MODIFY] src/App.jsx
Replace flat layout with `react-router-dom` `<BrowserRouter>`, `<Routes>`, shared `<Layout>` wrapper.

#### [NEW] src/components/Layout/Layout.jsx
Shared layout shell (Navbar + page content + Footer + Cart sidebar).

#### [NEW] src/components/PageTransition/PageTransition.jsx
Framer Motion page enter/exit animations.

---

### Homepage (Complete Rebuild)

The homepage becomes a **12-section cinematic journey**:

| # | Section | Component |
|---|---------|-----------|
| 1 | Cinematic Hero | `HeroRevamped` — 4K image, parallax title, animated steam/leaves |
| 2 | Brand Philosophy | `Philosophy` — "More than tea. A ritual." editorial strip |
| 3 | Founder Story | `FounderStory` — Nirmal Raj + Daniel Dhanaseelan tribute |
| 4 | Nilgiris Heritage | `Heritage` — Mountain sourcing, biodynamic, fairtrade |
| 5 | Tea Categories | `CategoryShowcase` — Visual category browser (13 categories) |
| 6 | Featured Teas | `FeaturedTeas` — 6 hero products with quick-add |
| 7 | Kombucha Spotlight | `KombuchaSpotlight` — Energetic probiotic section |
| 8 | Tea Tasting CTA | `TastingCTA` — Exclusive experience callout |
| 9 | Café Experience | `CafePreview` — Cozy interiors, mountain vibe |
| 10 | Social Proof | `Testimonials` — Reviews carousel |
| 11 | Gallery Strip | `GalleryStrip` — Cinematic photo mosaic |
| 12 | Newsletter + Footer | Enhanced `Footer` with newsletter |

---

### Generated Images Needed (Phase 1)

| Asset | Description |
|---|---|
| `hero_4k` | Ultra-sharp cinematic matcha/tea glass on mossy Nilgiris stone, steam, floating leaves, sharp focus |
| `founder_portrait` | Cinematic portrait of a tea master in a misty tea garden |
| `nilgiris_garden` | Aerial/sweeping view of lush Nilgiris tea estates, mountain mist |
| `tea_pouring` | Close-up of amber tea being poured, steam, glass reflections |
| `cafe_interior` | Cozy warm-lit café interior with wooden tables, tea cups, plants |
| `kombucha_bottles` | Row of artisanal kombucha bottles, fresh fruit, slate surface |

---

## Phase 2 — Shop & Product Pages

### Shop Page
#### [NEW] src/pages/Shop/Shop.jsx
Premium e-commerce grid with:
- Category sidebar filter (13 categories)
- Search bar with instant results
- Sort by: Price, Name, Popularity, New Arrivals
- Wishlist toggle on each card
- Quick-view modal
- Add-to-cart with quantity selector
- GST-ready pricing display
- Stock status badges
- Smooth stagger animations
- Mobile filter drawer

### Product Detail Page
#### [NEW] src/pages/ProductDetail/ProductDetail.jsx
Luxury single-product view:
- Hero product image gallery
- Tasting notes, aroma profile, origin
- Brewing guide with timer/temperature
- Steeping instructions
- Pairing recommendations
- Health benefits
- Related teas carousel
- Add to cart / Add to wishlist
- Breadcrumb navigation

### Product Data
#### [NEW] src/data/products.js
Full catalog of 15+ Danjo teas + kombucha + accessories with:
- Name, price, category, description
- Tasting notes, aroma, origin
- Brewing temp, steep time, servings
- Tags, stock, images

### Cart & Checkout
#### [MODIFY] src/components/Cart/Cart.jsx
Enhanced cart with coupon input, shipping options, item notes.

#### [NEW] src/pages/Checkout/Checkout.jsx
Multi-step checkout: Shipping → Payment → Confirmation with GST invoice.

---

## Phase 3 — Storytelling & Specialty Pages

| Page | Path | Purpose |
|---|---|---|
| Tea Tasting | `/tasting` | Reservation system, 2-3hr experience, ₹3500/4 ppl |
| Kombucha | `/kombucha` | 6 flavors, probiotic education, FAQ |
| Heritage | `/heritage` | Nilgiris documentary storytelling |
| Founder | `/founder` | Nirmal Raj + Daniel Dhanaseelan tribute |
| Café | `/cafe` | Interior gallery, WiFi, menu, atmosphere |
| Gallery | `/gallery` | Cinematic photo masonry grid |
| Journal | `/journal` | Blog/stories editorial layout |
| Contact | `/contact` | Map, hours, WhatsApp, form |
| FAQ | `/faq` | Accordion-style answers |
| Shipping | `/shipping` | Policies page |
| Account | `/account` | Login/signup, order history |
| Booking | `/booking` | Reservation form with date/time picker |

---

## Verification Plan

### After Each Phase
- `npm run build` — zero errors
- Visual review at `http://localhost:5173`
- Test navigation between all pages
- Test cart add/remove/checkout flow
- Test mobile responsiveness
- Test page transition animations

### Final Verification
- All 20+ routes functional
- Cart persists across pages
- Wishlist persists in localStorage
- Search and filter work correctly
- All images render sharply
- Smooth scroll and animation performance
