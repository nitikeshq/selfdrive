# DriveEase - Self-Drive Car & Bike Rental Platform

## Overview
DriveEase is a full-stack vehicle rental platform facilitating hourly, daily, or weekly self-drive car and bike rentals. It supports customers, vehicle owners, and administrators, offering a modern, trust-focused booking experience inspired by Airbnb and Uber. Key features include real-time availability, integrated Stripe payments, and flexible pickup options. The platform aims to provide a seamless rental experience, empowering both vehicle owners to earn passive income and customers to find suitable vehicles easily.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Tooling**: React 18 with TypeScript, Vite, Wouter for routing, TailwindCSS for styling.
- **UI/UX Decisions**: Custom color palette (HSL, light/dark mode), Inter and Outfit fonts, elevation system for interactivity, border radius system (lg, md, sm), Shadcn/ui components based on Radix UI, "New York" style component variants.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms, React Context for theme.

### Backend Architecture
- **Runtime & Framework**: Node.js with Express.js, TypeScript for end-to-end type safety.
- **API Design**: RESTful endpoints, session-based authentication (express-session), role-based access control (isAuthenticated, isAdmin, isOwner) with cookie-based sessions, Bcrypt for password hashing.
- **Core Features**:
    - **Dual-mode Navigation**: Seamless switching between customer and owner interfaces, dynamically displaying relevant navigation and content.
    - **Owner Management**: Dashboards for vehicle management (CRUD, status toggle), transaction overview (revenue, earnings, commission), and owner onboarding flow (marketing page, unauthenticated vehicle listing with auth modal).
    - **Customer Features**: Profile management, document upload (Aadhar, Driving License, Profile Photo) securely stored in S3, seamless booking flow with pre-filled times.
    - **Admin Features**: Addon Products management (CRUD, categories, status toggle) via `/admin/addons`.

### Data Storage
- **Database**: PostgreSQL via Neon (serverless), Drizzle ORM for type-safe queries.
- **Schema Design**:
    - **Users**: Authentication details, roles, KYC, wallet, security deposit, ratings.
    - **Vehicles**: Owner reference, details, pricing, location, features, status.
    - **Bookings**: Customer/vehicle references, dates, payment, status, verification.
    - **Supporting Tables**: Owner Addresses, Vehicle Documents, Ratings, Challans, Video Verifications, Sessions, Toll Fees, Addon Products, Owner Addon Purchases.
- **Object Storage**: AWS S3 for secure document and image storage with an abstraction layer for provider flexibility.

## External Dependencies

- **Payment Processing**: Stripe integration (@stripe/stripe-js, @stripe/react-stripe-js, Stripe API) for secure transactions.
- **Object Storage**: AWS S3 for all file uploads (documents, images), configurable via environment variables.
- **Development Tools**: Replit-specific plugins (error overlay, banner, Cartographer).
- **Session Storage**: connect-pg-simple for PostgreSQL-backed express sessions.
- **Email Service**: Nodemailer for transactional emails (SMTP) with HTML templates.
- **Validation & Type Safety**: Zod for runtime validation, drizzle-zod for schema generation.