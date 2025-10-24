# SelfDriveKaro.com - Self-Drive Car & Bike Rental Platform

**Motto:** "Your Journey, Your Way"

## Overview
SelfDriveKaro.com (SDK) is a full-stack vehicle rental platform now available in Bhubaneswar, inspired by Airbnb and Uber, facilitating hourly, daily, or weekly self-drive car and bike rentals. It connects customers with vehicle owners and provides an intuitive platform for administrators. The platform offers real-time vehicle availability, integrated payment solutions, and flexible pickup options. Its primary goal is to empower vehicle owners to generate passive income and offer customers a seamless, trust-focused rental experience. The project aims for near-perfect legal compliance and comprehensive protection for all users.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 24, 2025)
- **Lead Capture System**: All booking attempts are captured BEFORE payment. Bookings are created with "pending" status before redirecting to payment gateway, ensuring no customer data is lost even if payment is abandoned. Pending bookings serve as valuable sales leads.
- **Comprehensive Edit Profile System**: Added 4-tab profile editing interface (Personal, Security, Documents, Owner/Vendor) with react-hook-form validation
- **Personal Info Tab**: Edit name and phone number
- **Security Tab**: Password change with current password validation
- **Documents Tab**: KYC document upload (Aadhar, DL, Profile Photo) via S3
- **Owner/Vendor Tab**: Payment details (bank account, UPI, PAN, GST), company info, and company logo upload via S3
- **Vehicle Image Upload**: Added dual upload options (URL input or S3 file upload) to List Vehicle page
- **KYC Enforcement**: Implemented booking validation - authenticated users must upload Aadhar + DL before booking
- **Payment Details Enforcement**: Vehicles from owners without complete bank details are hidden from public listing
- **AWS S3 Integration**: All file uploads (vehicle images, documents, company logos, profile photos) use direct S3 upload via ObjectUploader component with custom environment variable names (AWS_API_KEY, AWS_S3_REGION). No files pass through the server - all uploads go directly from browser to S3.

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
    - **Owner Management**: Dashboards for vehicle CRUD with dual image upload options (URL input or S3 file upload), status toggling, transaction overview, and a guided owner onboarding flow. Owner/Vendor profile tab for managing payment details (bank account, IFSC code, UPI ID, PAN, GST), company information (company name, logo upload via S3). **Payment Details Enforcement**: Vehicles are hidden from /vehicles listing if owner hasn't provided complete bank details (account number, holder name, IFSC). Includes comprehensive legal agreement tracking and acceptance system (Owner Terms & Conditions, Rental Agreement template, pickup verification with digital signatures and video uploads). Owner insurance request system for requesting coverage quotes.
    - **Customer Features**: Comprehensive profile editing with 4-tab interface (Personal Info, Security, Documents, Owner/Vendor). Personal info editing (name, phone), password change with current password validation, KYC document upload (Aadhar, Driving License, Profile Photo) to S3. Streamlined booking flow with inline guest registration/login, coupon code system for promotional discounts, and a rewards system that automatically applies discounts. **KYC Enforcement**: Authenticated users must upload Aadhar and Driving License before making bookings (guest bookings unaffected).
    - **Customer Support**: Multi-channel support system with WhatsApp (+91 9337 912331, 24/7), Email (support@selfdrivekaro.com, always active), and Phone (+91 9337 912331, 9 AM-7 PM, emergency anytime). Dedicated Support page with contact form, FAQs, and support hours. Contact cards displayed prominently on home page for easy access.
    - **Coupon System**: Promotional discount codes with multiple types (percentage, fixed amount, free hours). Real-time validation on checkout with automatic discount calculation. Supports usage limits, expiry dates, and minimum booking requirements. The "NEWHOUR" campaign offers 1 free hour for first-time users.
    - **Guest Checkout**: Users see a modal with three options when proceeding to payment: (1) Guest Checkout - quick booking with just name, email, and phone (no account required), (2) Login for existing users, (3) Register to create an account. All three options seamlessly proceed to payment after completion. Guest bookings can later be claimed by registering with the same email.
    - **Admin Features**: CRUD operations for addon products and comprehensive coupon management (create, edit, toggle active status, delete) with admin dashboard at /admin/coupons.
    - **Legal Compliance**: Force Majeure, Indemnification, Insurance Coverage Disclosure, Emergency Contact Protocol, Breakdown & Accident Procedures clauses integrated into Terms and Conditions. Agreement tracking includes IP, user agent, digital signatures, and timestamps.
    - **Payment System**: Integrated payment gateway for booking and membership fees, with split payment support and owner payment details management (bank, UPI, PAN, GST).
    - **Referral & Membership**: Referral rewards and annual premium membership with exclusive benefits like free delivery/pickup and late fee waivers. Membership and Rewards are unified in a single page showing membership benefits, purchase options, rewards balance, and transaction history.
    - **Multi-Vendor System**: Support for rental partners and agencies. Vendors can register with company name and logo, build their brand profile with ratings and stats, and list multiple vehicles under their business. Features include: searchable vendor directory (/vendors as "Rental Partners"), individual vendor profile pages with fleet overview and aggregate ratings, and vendor-specific branding throughout the platform.
    - **Vehicle Listing**: Comprehensive vehicle types and categories system. **Types**: Car or Bike. **Car Categories**: Economy, Hatchback, Sedan, Prime Sedan, Compact, SUV, XUV, MUV, Compact SUV, Premium, Luxury, Luxury Sedan, Super Cars, Sports Car, EV Car. **Bike Categories**: Commuter Bike, Standard Bike, Sports Bike, Cruiser Bike, Premium Bike, Scooter, EV Bike, EV Scooter. Includes document upload (RC, Insurance, PUC) with secure storage, and real-time status badges (Available, Paused, Booked).
    - **SEO**: Local Business JSON-LD, comprehensive meta tags, Open Graph, and Twitter cards for all pages.

### Data Storage
- **Database**: PostgreSQL via Neon (serverless), Drizzle ORM for type-safe queries.
- **Schema Design**: Comprehensive tables for Users (with vendor fields: isVendor, companyName, companyLogoUrl), Vehicles, Bookings, Owner Addresses, Vehicle Documents, Ratings, Challans, Video Verifications, Sessions, Toll Fees, Addon Products, Owner Addon Purchases, Referrals, Wallet Transactions, Insurance Requests, and Coupons (promotional discount system).
- **Object Storage**: AWS S3 for secure storage of documents and images, with an abstraction layer for flexibility.

## External Dependencies

- **Payment Processing**: PayUMoney for all payment transactions (bookings, memberships).
- **Object Storage**: AWS S3 for all file uploads (vehicle images, documents, user KYC).
- **Session Storage**: connect-pg-simple for PostgreSQL-backed Express sessions.
- **Email Service**: Nodemailer for transactional emails (e.g., contact form submissions).
- **Validation & Type Safety**: Zod for runtime validation, drizzle-zod for schema generation.