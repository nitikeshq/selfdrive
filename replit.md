# SelfDriveKaro.com - Self-Drive Car & Bike Rental Platform

**Motto:** "Your Journey, Your Way"

## Overview
SelfDriveKaro.com (SDK) is a full-stack vehicle rental platform now available in Bhubaneswar, inspired by Airbnb and Uber, facilitating hourly, daily, or weekly self-drive car and bike rentals. It connects customers with vehicle owners and provides an intuitive platform for administrators. The platform offers real-time vehicle availability, integrated payment solutions, and flexible pickup options. Its primary goal is to empower vehicle owners to generate passive income and offer customers a seamless, trust-focused rental experience. The project aims for near-perfect legal compliance and comprehensive protection for all users.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Tooling**: React 18 with TypeScript, Vite, Wouter for routing, TailwindCSS for styling.
- **UI/UX Decisions**: Custom HSL-based color palette (light/dark mode), Inter and Outfit fonts, elevation system, standardized border radius, Shadcn/ui components based on Radix UI with "New York" style variants.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for form management, React Context for theme.

### Backend Architecture
- **Runtime & Framework**: Node.js with Express.js, TypeScript for end-to-end type safety.
- **API Design**: RESTful endpoints, session-based authentication (express-session), role-based access control (isAuthenticated, isAdmin, isOwner) with cookie-based sessions, Bcrypt for password hashing.
- **Core Features**:
    - **Dual-mode Navigation**: Seamless switching between customer and owner interfaces.
    - **Owner Management**: Dashboards for vehicle CRUD, status toggling, transaction overview, and a guided owner onboarding flow. Includes a comprehensive legal agreement tracking and acceptance system (Owner Terms & Conditions, Rental Agreement template, pickup verification with digital signatures and video uploads). Owner insurance request system for requesting coverage quotes.
    - **Customer Features**: Profile and document upload (Aadhar, Driving License, Profile Photo) to S3, streamlined booking flow, and a rewards system that automatically applies discounts.
    - **Customer Support**: Multi-channel support system with WhatsApp (+91 9337 912331, 24/7), Email (support@selfdrivekaro.com, always active), and Phone (+91 9337 912331, 9 AM-7 PM, emergency anytime). Dedicated Support page with contact form, FAQs, and support hours. Contact cards displayed prominently on home page for easy access.
    - **Admin Features**: CRUD operations for addon products.
    - **Legal Compliance**: Force Majeure, Indemnification, Insurance Coverage Disclosure, Emergency Contact Protocol, Breakdown & Accident Procedures clauses integrated into Terms and Conditions. Agreement tracking includes IP, user agent, digital signatures, and timestamps.
    - **Payment System**: Integrated payment gateway for booking and membership fees, with split payment support and owner payment details management (bank, UPI, PAN, GST).
    - **Referral & Membership**: Referral rewards and annual premium membership with exclusive benefits like free delivery/pickup and late fee waivers.
    - **Vehicle Listing**: Comprehensive vehicle types and categories system. **Types**: Car or Bike. **Car Categories**: Economy, Hatchback, Sedan, Prime Sedan, Compact, SUV, XUV, MUV, Compact SUV, Premium, Luxury, Luxury Sedan, Super Cars, Sports Car, EV Car. **Bike Categories**: Commuter Bike, Standard Bike, Sports Bike, Cruiser Bike, Premium Bike, Scooter, EV Bike, EV Scooter. Includes document upload (RC, Insurance, PUC) with secure storage, and real-time status badges (Available, Paused, Booked).
    - **SEO**: Local Business JSON-LD, comprehensive meta tags, Open Graph, and Twitter cards for all pages.

### Data Storage
- **Database**: PostgreSQL via Neon (serverless), Drizzle ORM for type-safe queries.
- **Schema Design**: Comprehensive tables for Users, Vehicles, Bookings, Owner Addresses, Vehicle Documents, Ratings, Challans, Video Verifications, Sessions, Toll Fees, Addon Products, Owner Addon Purchases, referrals, walletTransactions, and insuranceRequests.
- **Object Storage**: AWS S3 for secure storage of documents and images, with an abstraction layer for flexibility.

## External Dependencies

- **Payment Processing**: PayUMoney for all payment transactions (bookings, memberships).
- **Object Storage**: AWS S3 for all file uploads (vehicle images, documents, user KYC).
- **Session Storage**: connect-pg-simple for PostgreSQL-backed Express sessions.
- **Email Service**: Nodemailer for transactional emails (e.g., contact form submissions).
- **Validation & Type Safety**: Zod for runtime validation, drizzle-zod for schema generation.