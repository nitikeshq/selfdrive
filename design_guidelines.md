# Design Guidelines: Self-Drive Car & Bike Rental Platform

## Design Approach: Reference-Based (Airbnb + Uber Mobility)

Drawing inspiration from Airbnb's booking experience, Uber's mobility interface, and modern e-commerce platforms to create a premium, trustworthy rental platform.

**Core Principles:**
- Trust & Safety First: Clear vehicle information, transparent pricing, verified listings
- Effortless Discovery: Intuitive search, smart filters, visual-first browsing
- Streamlined Conversion: Minimal friction from browse to book

---

## Color Palette

**Light Mode:**
- Primary Brand: 220 85% 25% (Deep Blue - trust, reliability)
- Primary Hover: 220 85% 20%
- Accent: 160 60% 45% (Teal - action, movement)
- Success: 142 71% 45% (Green - confirmation)
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%

**Dark Mode:**
- Primary Brand: 220 70% 50%
- Accent: 160 55% 50%
- Background: 220 20% 8%
- Surface: 220 15% 12%
- Text Primary: 0 0% 95%
- Text Secondary: 220 5% 65%

---

## Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - body text, UI elements
- Display: 'Outfit' (Google Fonts) - headings, hero text

**Hierarchy:**
- Hero Display: text-5xl to text-7xl, font-bold (Outfit)
- Page Headings: text-3xl to text-4xl, font-semibold (Outfit)
- Section Titles: text-2xl, font-semibold (Inter)
- Body Large: text-lg, font-normal
- Body: text-base, font-normal
- Caption: text-sm, text-secondary

---

## Layout System

**Spacing Primitives:** Use tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm (p-4, h-8, my-12, gap-6, etc.)

**Container Widths:**
- Landing sections: max-w-7xl mx-auto px-6
- Content areas: max-w-6xl mx-auto px-4
- Forms & Cards: max-w-2xl

**Grid Patterns:**
- Vehicle cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Feature sections: grid-cols-1 md:grid-cols-2
- Stats/Trust indicators: grid-cols-2 md:grid-cols-4

---

## Landing Page Structure

### Hero Section (80vh)
**Large hero image:** Premium sports car or bike on scenic road, slightly darkened overlay (bg-black/40)
- Centered content with search bar prominence
- Hero headline: "Your Journey, Your Vehicle, Your Schedule"
- Subheading: "Book self-drive cars & bikes with instant confirmation"
- Integrated search component: Location, pickup date/time, vehicle type filters in a single elevated card (bg-white dark:bg-surface with shadow-2xl)
- Buttons with blurred backgrounds (backdrop-blur-md) when on images

### Trust Indicators Bar
4-column stats grid: "10,000+ Vehicles", "50,000+ Happy Riders", "24/7 Support", "Verified Owners"

### How It Works Section (py-20)
3-column grid with icons and descriptions:
1. Browse & Select (vehicle icon)
2. Upload DL & Pay (document + payment icon)
3. Choose Pickup Option (location pin + delivery truck icon)

### Featured Vehicles Section (py-24)
Grid of premium vehicle cards with:
- High-quality vehicle photos
- Vehicle name, type badge, hourly/daily rate
- Key specs (seats, fuel type, transmission)
- "Book Now" CTA

### Pickup Options Highlight (py-20)
2-column split layout:
- Left: Self-pickup from parking (with icon and pricing)
- Right: Doorstep delivery (with icon and premium pricing badge)
- Visual distinction with colored borders/backgrounds

### Why Choose Us Section (py-24)
4-column feature grid:
- Verified DL Check, Transparent Pricing, Flexible Hours, Instant Booking
- Each with icon, title, description

### Testimonials (py-20)
3-column cards with customer photos, quotes, ratings

### Owner CTA Section (py-24)
Split layout: "Own a Vehicle? Earn Extra Income"
- Left: Benefits list with checkmarks
- Right: Large "List Your Vehicle" button with owner dashboard preview

### Footer
Rich footer with newsletter signup, quick links (About, FAQ, Terms, Privacy), social links, contact info, trust badges (secure payment, verified listings)

---

## Component Library

### Vehicle Cards
- Rounded corners (rounded-xl)
- Hover elevation (hover:shadow-2xl transition-shadow)
- Image with overlay gradient for price badge
- Structured info: title, rating, specs grid, price, CTA button

### Booking Flow Cards
- Multi-step progress indicator at top
- Large, clear section headings
- Form inputs with icons (calendar, location, user)
- Pickup option toggles with visual distinction (border-2 when selected)
- DL upload area: dashed border, drag-drop zone, preview thumbnail
- Booking summary sidebar: sticky, itemized pricing, total with breakdown

### Search & Filters
- Floating search bar with shadow and rounded corners
- Dropdown filters with checkboxes (vehicle type, price range, features)
- Applied filters as dismissible chips
- Real-time results count

### Payment Integration
- Stripe Elements styling matching brand colors
- Security badges (SSL, PCI compliant)
- Saved payment methods cards
- Payment confirmation with animated success state

### Navigation
- Sticky header with logo, main nav, user profile/login
- Mobile: hamburger menu with slide-in drawer
- Notification bell with badge count
- Wallet balance display for logged-in users

### Dashboard Components (Owner & Admin)
- Stats cards with trend indicators
- Data tables with sorting, filters, pagination
- Calendar view for vehicle availability
- Earnings charts with time range selector

---

## Images Strategy

**Hero Section:** Large, high-quality image of luxury car on scenic road (2000x1200px recommended)

**Vehicle Listings:** Professional photos of each vehicle (800x600px), multiple angles

**How It Works:** Icon illustrations for each step (pickup, delivery, verification)

**Testimonials:** Customer headshots in circular frames (200x200px)

**Trust Indicators:** Brand logos of payment partners, safety certifications

**Owner Section:** Dashboard preview screenshot or owner with vehicle image

---

## Interactions & States

**Minimize animations:**
- Subtle hover elevations on cards (scale-105)
- Smooth transitions on interactive elements (transition-all duration-200)
- Loading states: skeleton screens for cards
- Form validation: inline error messages with icons

**Focus States:**
- 2px brand color ring on form inputs
- Clear focus indicators for keyboard navigation

**Empty States:**
- Illustration + helpful message for no results
- CTA to adjust filters or explore all vehicles

---

This design creates a premium, trustworthy booking experience that emphasizes ease of use, transparent pricing, and the unique dual pickup option, while maintaining visual consistency with modern rental and mobility platforms.