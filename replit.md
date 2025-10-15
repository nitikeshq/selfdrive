# DriveEase - Self-Drive Car & Bike Rental Platform

## Overview

DriveEase is a full-stack vehicle rental platform that enables customers to book self-drive cars and bikes on an hourly, daily, or weekly basis. The platform supports three core user roles: customers who rent vehicles, owners who list their vehicles, and administrators who oversee the platform. The application provides a modern, trust-focused booking experience inspired by Airbnb and Uber's design patterns, with features including real-time availability checking, integrated payment processing via Stripe, and flexible pickup options (parking pickup or doorstep delivery).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing without React Router overhead
- TailwindCSS for utility-first styling with custom design tokens
- Shadcn/ui component library built on Radix UI primitives for accessible, composable UI components

**State Management**
- TanStack Query (React Query) for server state management with automatic caching and refetching
- React Hook Form for performant form validation with Zod schema integration
- React Context for theme management (light/dark mode switching)

**Design System**
- Custom color palette with HSL values supporting both light and dark modes
- Typography hierarchy using Inter (body/UI) and Outfit (headings) font families
- Elevation system using `hover-elevate` and `active-elevate` utility classes for interactive feedback
- Border radius system: lg (9px), md (6px), sm (3px)
- Component variants following a "New York" style pattern with outline borders and subtle shadows

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js for the REST API server
- TypeScript for end-to-end type safety with shared types between client and server
- ESM (ES Modules) for modern JavaScript module support

**API Design**
- RESTful endpoints organized by resource (users, vehicles, bookings)
- Session-based authentication using express-session with PostgreSQL session storage
- Role-based access control middleware (isAuthenticated, isAdmin, isOwner)
- Bcrypt for secure password hashing

**Authentication Flow**
- Cookie-based sessions with httpOnly and secure flags in production
- 7-day session TTL (time to live)
- Support for email/password registration and login
- User roles: customer, owner, admin

### Data Storage

**Database**
- PostgreSQL via Neon serverless with WebSocket connections
- Drizzle ORM for type-safe database queries and migrations
- Connection pooling for optimal performance

**Schema Design**
- **Users table**: email, password hash, profile info, role, KYC documents (Aadhar, PAN, DL), KYC verification status, DigiLocker integration, wallet balance, security deposit tracking, bidirectional ratings (as customer and as owner)
- **Owner Addresses table**: multiple addresses per owner with default address selection, supports address changes
- **Vehicles table**: owner reference, vehicle details (type, brand, model, year), pricing (hourly/daily), location, features array, extra insurance option, GPS tracking requirement, vehicle ratings, pause/active status
- **Vehicle Documents table**: registration, RC, insurance, PUC documents with verification status and expiry tracking
- **Bookings table**: customer/vehicle references, date range, pickup option, delivery address, payment info, insurance selection, video verification approval from both parties, status tracking, cancellation with refund logic
- **Ratings table**: bidirectional ratings system (customer→owner, owner→customer, customer→vehicle)
- **Challans table**: traffic violation tracking with date/time matching to identify responsible customer, proof uploads by owner
- **Video Verifications table**: pickup video approval workflow requiring confirmation from both customer and owner
- **Sessions table**: express-session storage for authentication state

**Data Relationships**
- One-to-many: Owner → Vehicles
- One-to-many: Owner → Addresses
- One-to-many: Vehicle → Documents
- One-to-many: Customer → Bookings
- One-to-many: Vehicle → Bookings
- One-to-many: Booking → Ratings
- One-to-many: Vehicle → Challans
- One-to-many: Booking → Video Verifications

### External Dependencies

**Payment Processing**
- Stripe integration for secure payment handling
- Client-side: @stripe/stripe-js and @stripe/react-stripe-js for payment UI
- Server-side: Stripe API v2025-09-30.clover for creating payment intents and processing transactions
- Payment flow: Create booking → Generate payment intent → Client confirms payment → Update booking status

**Object Storage**
- Google Cloud Storage for uploading and serving vehicle images and user documents
- Replit sidecar authentication for GCS access
- Custom ACL (Access Control List) system for managing object permissions:
  - Public/private visibility settings
  - Owner-based access control
  - Permission types: READ, WRITE
- Uppy file uploader (@uppy/core, @uppy/aws-s3) for user-friendly upload experience

**Image Hosting**
- Unsplash for demo/placeholder vehicle images
- Support for custom uploaded images via Google Cloud Storage

**Development Tools**
- Replit-specific plugins for development experience:
  - Runtime error overlay modal
  - Development banner
  - Cartographer for code navigation
- Environment variable management for API keys and database URLs

**Session Storage**
- connect-pg-simple for PostgreSQL-backed express sessions
- Prevents session loss on server restart
- Configurable TTL and automatic cleanup

**Validation & Type Safety**
- Zod schemas for runtime validation of API requests
- drizzle-zod for automatic schema generation from database models
- Shared type definitions between client and server via @shared/schema