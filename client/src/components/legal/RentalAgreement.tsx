import { Booking, Vehicle, User } from "@shared/schema";
import { format } from "date-fns";

interface RentalAgreementProps {
  booking: Booking;
  vehicle: Vehicle;
  owner: User;
  customer: User | null;
  guestName?: string;
}

export default function RentalAgreement({ booking, vehicle, owner, customer, guestName }: RentalAgreementProps) {
  const customerName = customer?.name || guestName || "Guest Customer";
  const customerEmail = customer?.email || booking.guestEmail || "";
  const customerPhone = customer?.phone || booking.guestPhone || "";

  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">Vehicle Rental Agreement</h1>
      
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Agreement Details</h3>
        <div className="grid grid-cols-2 gap-4 text-blue-800 dark:text-blue-200">
          <div>
            <p className="text-sm font-medium">Booking ID:</p>
            <p className="font-mono">{booking.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Date:</p>
            <p>{format(new Date(), 'PPP')}</p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Parties to the Agreement</h2>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">OWNER (First Party):</h3>
          <p><strong>Name:</strong> {owner.name}</p>
          <p><strong>Email:</strong> {owner.email}</p>
          <p><strong>Phone:</strong> {owner.phone}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">CUSTOMER (Second Party):</h3>
          <p><strong>Name:</strong> {customerName}</p>
          <p><strong>Email:</strong> {customerEmail}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Vehicle Details</h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <p><strong>Make & Model:</strong> {vehicle.make} {vehicle.model}</p>
          <p><strong>Year:</strong> {vehicle.year}</p>
          <p><strong>Registration Number:</strong> {vehicle.registrationNumber}</p>
          <p><strong>Vehicle Type:</strong> {vehicle.type}</p>
          <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
          <p><strong>Color:</strong> {vehicle.color}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Rental Period & Payment</h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <p><strong>Pickup Date & Time:</strong> {format(new Date(booking.startDate), 'PPP p')}</p>
          <p><strong>Return Date & Time:</strong> {format(new Date(booking.endDate), 'PPP p')}</p>
          <p><strong>Rental Amount:</strong> ₹{booking.totalAmount}</p>
          <p><strong>Security Deposit:</strong> ₹{booking.securityDeposit || 0}</p>
          <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Terms & Conditions</h2>
        
        <h3 className="text-lg font-semibold mt-6 mb-3">1. Customer Obligations</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>The customer must possess a valid driving license at the time of pickup</li>
          <li>The customer agrees to use the vehicle solely for personal/lawful purposes</li>
          <li>The customer will not sub-let, rent, or transfer the vehicle to any third party</li>
          <li>The customer will not use the vehicle for racing, off-roading, or illegal activities</li>
          <li>The customer will maintain the vehicle in good condition during the rental period</li>
          <li>The customer will not carry any illegal substances or items in the vehicle</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">2. Vehicle Condition & Verification</h3>
        <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 p-4 mb-4">
          <p className="font-semibold text-amber-900 dark:text-amber-100">Mandatory Video Verification</p>
          <p className="mt-2 text-amber-800 dark:text-amber-200">
            Both parties must record and approve video verification showing the vehicle's condition, fuel level, 
            odometer reading, and any existing damages at both pickup and return.
          </p>
        </div>
        <ul className="list-disc ml-6 space-y-2">
          <li>The customer accepts the vehicle in its current condition as verified at pickup</li>
          <li>Any damages not documented in pickup video will be customer's responsibility</li>
          <li>The customer must return the vehicle in the same condition (normal wear and tear excepted)</li>
          <li>Fuel level must match at return or customer will pay fuel cost plus ₹500 service charge</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">3. Damages & Liability</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Customer is liable for any damages, loss, or theft during the rental period</li>
          <li>Security deposit will be used to cover repair costs for damages</li>
          <li>If damages exceed security deposit, customer must pay the difference within 7 days</li>
          <li>Customer must report any accidents or incidents to owner and police immediately</li>
          <li>Customer is liable for all traffic violations, challans, and penalties incurred</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">4. Late Return & Penalties</h3>
        <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 mb-4">
          <p className="font-semibold text-red-900 dark:text-red-100">Late Return Charges</p>
          <ul className="mt-2 space-y-1 text-red-800 dark:text-red-200">
            <li>• <strong>Grace Period:</strong> 30 minutes (waived for Premium Members)</li>
            <li>• <strong>Late Fee:</strong> 2x hourly rate for delay beyond grace period</li>
            <li>• <strong>Extended Delay:</strong> Additional ₹500/hour after 3 hours late</li>
          </ul>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">5. Insurance & Coverage</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Vehicle is covered under owner's insurance policy</li>
          <li>Customer can opt for additional insurance coverage at extra cost</li>
          <li>Insurance does not cover theft, unlawful activities, or drunk driving</li>
          <li>Customer must cooperate fully in any insurance claim process</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">6. Cancellation & Refunds</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Cancellation more than 24 hours before pickup: Full refund minus ₹100 processing fee</li>
          <li>Cancellation within 24 hours: 50% refund</li>
          <li>Cancellation within 6 hours or no-show: No refund</li>
          <li>Security deposit refunded within 7 days after vehicle return and verification</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">7. Jurisdiction & Disputes</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>This agreement is governed by Indian laws and Motor Vehicles Act</li>
          <li>All disputes are subject to Bhubaneswar, Odisha jurisdiction only</li>
          <li>Both parties agree to first attempt resolution through DriveEase mediation</li>
          <li>Digital signatures and video verifications are considered valid legal evidence</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Emergency Contact</h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <p><strong>DriveEase Support:</strong> nitikesh@qwegle.com</p>
          <p><strong>Emergency Helpline:</strong> Contact owner directly</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Available 24/7 for accidents, breakdowns, or urgent assistance
          </p>
        </div>
      </section>

      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mt-8">
        <p className="font-semibold mb-4">Declaration by Both Parties:</p>
        <p className="mb-4">
          We, the undersigned, have read and understood all the terms and conditions of this rental agreement. 
          We agree to be bound by these terms and acknowledge that this digital agreement, along with video verification, 
          constitutes a legally binding contract.
        </p>
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="font-semibold">Owner's Digital Signature</p>
            <p className="text-sm text-muted-foreground">(Type full name to sign)</p>
          </div>
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="font-semibold">Customer's Digital Signature</p>
            <p className="text-sm text-muted-foreground">(Type full name to sign)</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-6 text-center">
        This agreement is facilitated through DriveEase platform - Made in Odisha, India 🇮🇳
      </p>
    </div>
  );
}
