import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  // Scroll to top when page loads (helps mobile users see the page changed)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-4" data-testid="text-privacy-title">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">We collect the following types of information:</p>
              <h4 className="font-semibold mt-4 mb-2">Personal Information:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name (First and Last)</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Driver's license information (verified at pickup)</li>
                <li>Payment information (processed securely through PayU)</li>
              </ul>
              <h4 className="font-semibold mt-4 mb-2">Usage Information:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Booking history and rental details</li>
                <li>Vehicle preferences</li>
                <li>Location data for pickup and delivery services</li>
                <li>Communication with customer support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and manage your vehicle bookings</li>
                <li>To verify your identity and driver's license</li>
                <li>To process payments securely through PayU payment gateway</li>
                <li>To communicate booking confirmations, updates, and reminders</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To improve our services and user experience</li>
                <li>To comply with legal obligations and prevent fraud</li>
                <li>To send promotional offers and updates (with your consent)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">We take data security seriously:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All personal data is stored securely using industry-standard encryption</li>
                <li>Driver's license information is verified at pickup and stored only for legal compliance</li>
                <li>Payment information is processed through PayU's secure payment gateway and not stored on our servers</li>
                <li>We use HTTPS/SSL encryption for all data transmission</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
                <li>Regular security audits and updates are performed</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">We do not sell or rent your personal information. We may share information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Vehicle Owners:</strong> Basic booking details and contact information for rental coordination</li>
                <li><strong>Payment Processors:</strong> PayU for secure payment processing</li>
                <li><strong>Service Providers:</strong> Cloud storage providers and communication services</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and safety</li>
              </ul>
              <p className="mt-3">
                All third-party service providers are contractually bound to protect your information and use it only for specified purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Driver's License Verification</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Driver's license verification is mandatory for all vehicle rentals and is conducted at the time of pickup:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>You must present your valid driver's license when picking up the vehicle</li>
                <li>License information is verified on-site to ensure it matches the vehicle category</li>
                <li>We do not store digital copies of your license during the booking process</li>
                <li>License details may be recorded for rental agreement purposes and legal compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Essential cookies for authentication and session management</li>
                <li>Analytics cookies to understand how you use our platform</li>
                <li>Preference cookies to remember your settings</li>
              </ul>
              <p className="mt-3">
                You can control cookie preferences through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us through our Contact Us page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal, tax, and accounting requirements</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p className="mt-3">
                Booking records are typically retained for 7 years for legal compliance. Driver's license information 
                collected during pickup verification is retained as per legal requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal 
                information from children. If we become aware that we have collected information from a child, we will 
                take steps to delete it immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email 
                or through a notice on our platform. Continued use of our services after changes constitutes acceptance 
                of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                For questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-3 space-y-1">
                <p><strong>Email:</strong> privacy@selfdrivekaro.com</p>
                <p><strong>Address:</strong> SelfDriveKaro, Bhubaneswar, Odisha, India</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
