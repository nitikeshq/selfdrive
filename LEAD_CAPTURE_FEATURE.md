# Lead Capture Feature - Implementation Summary

## Overview
The lead capture feature allows customers to request a callback from vehicle owners before making a payment, providing flexibility in the booking process. Customers now have two options when booking a vehicle:
1. **Pay Advance Now** - Complete payment immediately (existing flow)
2. **Request Callback** - Save booking information and wait for owner contact before payment (new feature)

## Implementation Details

### 1. Database Schema Changes
**File**: `shared/schema.ts`
- Updated booking `status` field to support new "lead" status
- Existing statuses: "pending", "confirmed", "picked_up", "completed", "cancelled"
- New status: **"lead"** - for bookings awaiting callback

### 2. Email Notifications
**Files**: 
- `server/email.ts`
- `emailtemplates/lead-notification-owner.html`
- `emailtemplates/lead-notification-platform.html`

**Functionality**:
- When a customer requests a callback, two email notifications are sent:
  1. **Owner Notification**: Sent to the vehicle owner with customer details and booking information
  2. **Platform Notification**: Sent to the platform admin (admin@selfdrivekaro.com) for tracking

**Email Content Includes**:
- Customer name, email, and phone number
- Vehicle details
- Pickup and return dates/times
- Pickup option (parking/delivery)
- Total amount and revenue split (owner earnings & platform commission)
- Booking ID for reference

### 3. Backend API
**File**: `server/routes.ts`

**New Endpoint**: `POST /api/bookings/lead`
- Validates booking data using Zod schemas
- Supports both authenticated users and guest checkouts
- Creates booking with status="lead"
- Checks vehicle availability
- Sends email notifications to owner and platform
- Returns success message with booking details

**Response Format**:
```json
{
  "success": true,
  "booking": { ... },
  "message": "Booking inquiry submitted! The owner will contact you shortly."
}
```

### 4. Frontend Implementation
**File**: `client/src/pages/BookVehicle.tsx`

**Changes**:
- Added new state variables:
  - `showPaymentChoice`: Controls payment choice dialog visibility
  - `pendingBookingData`: Stores booking data before user choice
- Added `createLeadMutation`: Handles lead creation via API
- Modified booking flow:
  1. User fills booking form
  2. After authentication, payment choice dialog appears
  3. User selects "Pay Now" or "Request Callback"
  4. Appropriate action is taken based on choice

**Payment Choice Dialog**:
- Clear explanation of both options
- "Pay Advance Now" button - triggers existing payment flow
- "Request Callback" button - creates lead and sends notifications
- Loading states during API calls
- Success/error toast notifications
- Dialog can be closed/cancelled

## User Flow

### Request Callback Flow
1. Customer selects vehicle and fills booking details
2. Customer clicks "Proceed to Payment"
3. If not logged in, authentication modal appears (login/register/guest)
4. After authentication, **Payment Choice Dialog** appears with two options
5. Customer clicks "Request Callback"
6. Booking is created with status="lead"
7. Email sent to vehicle owner with customer details
8. Email sent to platform admin for tracking
9. Success message shown to customer
10. Customer redirected to homepage
11. Owner contacts customer to discuss booking details
12. Once agreed, owner manually confirms booking and processes payment

### Pay Advance Now Flow (Existing)
1-4. Same as above
5. Customer clicks "Pay Advance Now"
6. Booking created with status="pending"
7. Payment gateway opens
8. Customer completes payment
9. Booking confirmed

## Testing

### Manual Testing Steps
1. Go to any vehicle listing
2. Click "Book Now"
3. Fill in pickup/return dates
4. Select pickup option
5. Click "Proceed to Payment"
6. Login or register (if not authenticated)
7. **Verify Payment Choice Dialog Appears**
8. Test "Request Callback":
   - Click "Request Callback"
   - Verify success toast message
   - Check email inbox (owner and platform emails)
   - Verify booking appears in database with status="lead"
9. Test "Pay Advance Now":
   - Click "Pay Advance Now"
   - Verify payment gateway opens
   - Complete payment flow

### Email Configuration
**Important**: Email notifications require SMTP configuration in environment variables:
- `GMAIL_USER`: Gmail address for sending emails
- `GMAIL_PASS`: Gmail app password

If SMTP is not configured, emails will be logged to console instead of being sent.

## Benefits

### For Customers
- Flexibility to discuss booking details before payment
- No immediate payment pressure
- Can clarify doubts with owner before committing
- Suitable for high-value or long-duration bookings

### For Owners
- Opportunity to communicate directly with customers
- Can negotiate terms or provide additional information
- Builds trust and customer relationships
- Reduces cancellations by ensuring customer commitment

### For Platform
- Increased booking inquiries (lower barrier to entry)
- Better tracking of leads vs confirmed bookings
- Improved customer satisfaction
- Data for conversion rate optimization

## Technical Notes

### Architecture Decisions
1. **Separate API Endpoint**: Created `/api/bookings/lead` instead of adding a flag to existing endpoint for clarity and separation of concerns
2. **Email-based Notifications**: Uses email to ensure owner/platform receive notifications even if not logged in
3. **Status-based Tracking**: Uses booking status="lead" to differentiate from confirmed bookings
4. **Frontend State Management**: Uses React state and TanStack Query for optimal user experience

### Future Enhancements
1. **Dashboard for Leads**: Add a dedicated section in owner dashboard to view and manage leads
2. **Lead Conversion Tracking**: Track which leads convert to confirmed bookings
3. **Automated Follow-ups**: Send reminder emails if owner doesn't respond within 24 hours
4. **SMS Notifications**: Add SMS notifications for faster response (requires Twilio integration)
5. **Lead Status Updates**: Allow owners to mark leads as "contacted", "negotiating", "converted", or "lost"

## Files Modified/Created

### Created Files
- `emailtemplates/lead-notification-owner.html` - Owner notification template
- `emailtemplates/lead-notification-platform.html` - Platform notification template
- `LEAD_CAPTURE_FEATURE.md` - This documentation file

### Modified Files
- `server/email.ts` - Added lead notification functions
- `server/routes.ts` - Added `/api/bookings/lead` endpoint
- `shared/schema.ts` - Updated booking status documentation
- `client/src/pages/BookVehicle.tsx` - Added payment choice dialog and lead creation flow

## Deployment Notes
1. Ensure SMTP credentials are configured in production environment
2. Monitor email delivery logs to ensure notifications are being sent
3. Update platform admin email address if needed (currently: admin@selfdrivekaro.com)
4. Test both flows in staging before deploying to production
5. Document the new workflow for customer support team

## Support & Maintenance
- Monitor conversion rate from leads to confirmed bookings
- Track email delivery success rate
- Gather feedback from owners about lead quality
- Optimize email templates based on response rates
- Consider adding analytics to track user choice between "Pay Now" vs "Request Callback"
