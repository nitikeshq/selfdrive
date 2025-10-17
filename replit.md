# DriveEase - Self-Drive Car & Bike Rental Platform

## Team
- **Nitikesh Pattanayak** - Founder
- **Chinmay Gayan** - Co-founder

## Overview
DriveEase is a full-stack vehicle rental platform facilitating hourly, daily, or weekly self-drive car and bike rentals. It supports customers, vehicle owners, and administrators, offering a modern, trust-focused booking experience inspired by Airbnb and Uber. Key features include real-time availability, integrated Stripe payments, and flexible pickup options. The platform aims to provide a seamless rental experience, empowering both vehicle owners to earn passive income and customers to find suitable vehicles easily.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 17, 2025)
- **Owner Payment Details System** (Latest):
  - Added UPI ID and GST number fields to users schema for payment configuration
  - Created comprehensive payment details page at /owner/payment-details
  - Form captures bank account (account number, IFSC, holder name), UPI ID, PAN, GST number
  - Payment details required for owners to receive earnings (70% of booking amount)
  - Fixed booking date validation to accept string dates and convert to Date objects
  - Extended /api/auth/user endpoint to return all payment and KYC fields
  - Navigation links added to owner mode (desktop + mobile)
  - Validates payment details before allowing booking payments
- **UI Rebrand & Performance Optimization**:
  - Renamed "Wallet" to "Rewards" across entire platform (navbar, routes, page titles)
  - Rewards page displays balance and transaction history only (no payment options)
  - Membership activation properly redirects to PayUMoney payment gateway
  - Hero image optimized: responsive srcset (400w/800w/1200w), reduced quality (q=60), auto WebP format
  - Added preconnect to images.unsplash.com for faster image loading
  - Updated browserslist for modern browser targeting
  - Significant performance improvements targeting 1-2 second page loads
- **Contact Form & Email Integration**: Fully functional contact form with email delivery:
  - Updated email service to support Gmail configuration (GMAIL_EMAIL, GMAIL_APP_PASSWORD)
  - Created /api/contact endpoint for form submissions
  - Emails sent to nitikesh@qwegle.com with subject "Selfdrive - Inquiry has been received"
  - Professional HTML email template with all inquiry details and timestamp
  - ContactUs page with SEO meta tags optimized for "contact driveease bhubaneswar"
- **Local Business SEO Enhancement**: Comprehensive local SEO implementation for Bhubaneswar/Odisha:
  - Added schema.org LocalBusiness JSON-LD markup to landing page
  - Includes complete business details: address, phone, hours, geo-coordinates
  - Service catalog with hourly/daily/weekly rental offerings
  - Local keywords integration for better search visibility in Odisha region
  - Founder information (Nitikesh Pattanayak, Chinmay Gayan) in structured data
- **Rewards System Update**: Converted wallet to automatic rewards discount system:
  - Removed wallet as payment method option
  - Rewards balance now automatically deducts from booking total
  - Membership activation goes directly to PayUMoney (no wallet option)
  - Clear display of rewards discount and final payment amount
- **AWS S3 File Storage Configuration**: Configured AWS S3 for file uploads and object storage:
  - Updated storage provider to use AWS_S3_BUCKET_NAME environment variable
  - Supports both AWS_S3_BUCKET and AWS_S3_BUCKET_NAME for flexibility
  - S3 provider handles vehicle images, documents (RC, Insurance, PUC), and user KYC documents
  - Storage provider auto-fallback to local storage if S3 credentials missing
  - Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME, STORAGE_PROVIDER=s3
- **SEO Optimization**: Implemented comprehensive SEO across all pages:
  - Created reusable SEO component with meta tags, Open Graph, and Twitter cards
  - Landing page: Optimized for "car rental Bhubaneswar" and related local keywords
  - Vehicles page: Generic browse/search optimization
  - Book Vehicle page: Dynamic SEO with vehicle-specific titles, descriptions, and OG images
  - All pages include proper canonical URLs for search engine indexing
  - Loading and error states also have appropriate SEO meta tags
- **Wallet Payment System**: Added wallet balance payment option for bookings:
  - Users can pay for bookings using wallet balance via /api/pay-booking-wallet endpoint
  - Automatic wallet balance validation and deduction
  - Insufficient balance warnings with clear error messages
  - Dual payment methods: wallet (instant) or PayUMoney (redirect to gateway)
- **Performance Documentation**: Created PERFORMANCE_RECOMMENDATIONS.md with optimization strategies:
  - Bundle size reduction techniques (code splitting, tree shaking)
  - Lazy loading patterns for routes and heavy components
  - React.memo and useMemo optimization guidelines
  - Pagination strategies for large data sets
  - Image optimization recommendations
- **PayUMoney Payment Gateway Integration**: Replaced Stripe with PayUMoney for all payments:
  - Booking payments with 30% platform commission and 70% owner earnings
  - Membership payments (₹999 annual fee) with automatic activation
  - Hash-based security verification for all payment callbacks
  - Split payment support for owner settlements (pending 7-day implementation)
  - Environment variables: PAYUMONEY_MERCHANT_KEY, PAYUMONEY_SALT, PAYUMONEY_MERCHANT_ID
  - Dedicated PayUMoney service with hash generation and verification utilities
- **Referral & Membership System**: Complete implementation of referral rewards and premium membership:
  - Referral system: Users earn ₹50 for each successful referral with 90-day expiry
  - Membership: ₹999 annual premium membership with exclusive benefits
  - Free delivery/pickup for day-wise bookings (24h+) for members
  - 30-minute late fee waiver for bookings under 8 hours (members only)
  - 2x hourly rate penalty for late returns beyond stipulated time
  - Wallet system with transaction history and expiry tracking
  - Member badge displayed across platform for premium users
  - Referral code generation, sharing, and application system
  - Database tables: referrals, walletTransactions with proper expiry handling
- **Vehicle Document Upload System**: Implemented complete document upload workflow for vehicle listing:
  - Added rcDocumentUrl, insuranceDocumentUrl, pucDocumentUrl fields to vehicles table
  - RC and Insurance documents are mandatory; PUC is optional
  - ObjectUploader component integration for secure file uploads to object storage
  - Visual feedback with green badges when documents are uploaded
  - Client-side validation prevents submission without required documents
  - Backend ready for additional validation to ensure document URLs are present
- **Mobile Responsiveness Improvements**: Enhanced mobile experience across the platform:
  - DateTimePicker now responsive (h-11 mobile, h-10 desktop) with text truncation
  - Landing page search form optimized for mobile (1 col mobile, 2 cols sm, 4 cols lg)
  - All select elements have proper touch targets (h-11 mobile, h-10 desktop)
  - Added touch-manipulation CSS for better mobile interaction
  - Responsive padding (p-4 mobile, p-6 desktop) and gap spacing
- **Vehicle Categories**: Added category field to vehicles with Indian market categories (Super cars, Economy, Premium Cars, Compact cars, XUVs, Hatchbacks, Bikes, Scooters, Electric Bikes, Electric Cars)
- **Status Badge System**: Browse vehicles page now displays ALL vehicles with color-coded status badges:
  - Green badge: Available vehicles (ready to book)
  - Yellow badge: Paused vehicles (owner temporarily unavailable)
  - Orange badge: Booked vehicles (currently rented)
- **Enhanced Vehicle Listing**: /api/vehicles returns all vehicles with real-time status computation, optional location filtering
- **Swadeshi Branding**: Added "Made in India" and "Made in Odisha" badges to footer celebrating Indian heritage
- **Currency**: Verified INR (₹) currency symbol used consistently across all pricing displays

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