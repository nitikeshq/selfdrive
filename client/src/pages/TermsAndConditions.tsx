import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-4" data-testid="text-terms-title">
            Terms and Conditions
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                By accessing and using DriveEase's self-drive vehicle rental platform, you agree to be bound by these Terms and Conditions. 
                If you do not agree with any part of these terms, you must not use our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Eligibility and Requirements</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to rent a vehicle</li>
                <li>You must possess a valid driver's license for the vehicle type you wish to rent</li>
                <li>Driver's license must be uploaded and verified before booking confirmation</li>
                <li>You must provide accurate personal and contact information</li>
                <li>Services are currently available only in Bhubaneswar, Odisha</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Booking and Payment</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>All bookings require advance payment through our PayU payment gateway</li>
                <li>Payment must be completed to confirm your booking</li>
                <li>Prices are displayed in Indian Rupees (₹) and include applicable taxes</li>
                <li>Additional charges apply for doorstep delivery (₹200 extra)</li>
                <li>Rental rates are based on hourly, daily, or weekly periods as selected</li>
                <li>Late returns may incur additional charges at the hourly rate</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Vehicle Usage and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Vehicles must be used only for lawful purposes</li>
                <li>You are responsible for any traffic violations, fines, or penalties incurred during the rental period</li>
                <li>Vehicles must not be used for racing, towing, or any commercial purposes</li>
                <li>Smoking and consumption of alcohol or drugs in the vehicle is strictly prohibited</li>
                <li>You must return the vehicle in the same condition as received (normal wear and tear excepted)</li>
                <li>Any damage to the vehicle must be reported immediately</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Insurance and Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>All vehicles are covered by basic insurance as per Indian Motor Vehicles Act</li>
                <li>You are liable for any damage to the vehicle beyond normal wear and tear</li>
                <li>In case of accidents, you must file a police report and inform us immediately</li>
                <li>Security deposit may be required for certain vehicle categories</li>
                <li>You are responsible for personal belongings left in the vehicle</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Pickup and Return</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">We offer two pickup options:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Self-Pickup from Parking:</strong> Collect the vehicle from our designated parking locations at no extra cost</li>
                <li><strong>Doorstep Delivery:</strong> Get the vehicle delivered to your preferred location for an additional ₹200</li>
              </ul>
              <p className="mt-3">
                Vehicles must be returned to the same location from where they were picked up unless otherwise agreed. 
                Late returns will incur additional hourly charges.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cancellation and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>Cancellations made 24 hours before pickup time: 90% refund</li>
                <li>Cancellations made 12-24 hours before pickup: 50% refund</li>
                <li>Cancellations made less than 12 hours before pickup: No refund</li>
                <li>Refunds will be processed within 5-7 business days</li>
                <li>No refunds for early returns or unused rental periods</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Your personal information and driver's license details are collected and stored securely in accordance with our Privacy Policy. 
                We do not share your information with third parties except as required for payment processing and legal compliance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We reserve the right to refuse service or terminate bookings at any time for violations of these terms, 
                fraudulent activity, or any behavior that may harm our platform, vehicles, or other users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms 
                shall be subject to the exclusive jurisdiction of the courts in Bhubaneswar, Odisha.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                For any questions regarding these Terms and Conditions, please contact us through our Contact Us page 
                or email us at legal@driveease.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
