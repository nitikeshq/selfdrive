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
                By accessing and using SelfDriveKaro's self-drive vehicle rental platform, you agree to be bound by these Terms and Conditions. 
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
                <li>Driver's license must be presented and verified at the time of vehicle pickup</li>
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
                <strong>Important:</strong> You must bring your valid driver's license at the time of pickup for verification. 
                The license must match the vehicle category you've booked. Rental cannot proceed without proper license verification.
              </p>
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
              <p className="mb-3">Our cancellation policy is designed to be fair to both customers and vehicle owners:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cancellations 3 days (72 hours) or more before pickup:</strong> 100% refund minus processing fees (2% of booking amount)</li>
                <li><strong>Cancellations between 24-72 hours before pickup:</strong> 80% refund</li>
                <li><strong>Cancellations less than 24 hours before pickup:</strong> 60% refund</li>
                <li>Refunds will be processed to the original payment method within 5-7 business days</li>
                <li>No refunds for early returns or unused rental periods</li>
                <li>In case of booking cancellation by the vehicle owner or due to technical issues from our end, 100% refund will be provided</li>
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
              <CardTitle>10. Force Majeure</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">Neither SelfDriveKaro nor vehicle owners shall be held liable for any failure or delay in performance under these terms due to circumstances beyond reasonable control, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acts of God (earthquakes, floods, storms, pandemics)</li>
                <li>War, terrorism, civil unrest, or riots</li>
                <li>Government actions, regulations, or restrictions</li>
                <li>Labor strikes, lockouts, or transportation failures</li>
                <li>Power outages or telecommunications failures</li>
              </ul>
              <p className="mt-3">
                In the event of a force majeure situation, the affected party must notify the other party promptly. 
                Bookings affected by force majeure events will be eligible for full refunds or rescheduling at no additional charge.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">
                <strong>Customer Indemnification:</strong> You agree to indemnify, defend, and hold harmless SelfDriveKaro, vehicle owners, and their respective officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use or misuse of any rental vehicle</li>
                <li>Your violation of these Terms and Conditions</li>
                <li>Your violation of any law or the rights of a third party</li>
                <li>Any damage to the vehicle beyond normal wear and tear</li>
                <li>Any traffic violations, fines, or penalties incurred during the rental period</li>
              </ul>
              <p className="mt-3">
                <strong>Owner Indemnification:</strong> Vehicle owners agree to indemnify SelfDriveKaro against any claims arising from mechanical defects, undisclosed vehicle issues, or failure to maintain the vehicle in safe operating condition.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Insurance Coverage Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">
                <strong>Important Insurance Information:</strong> Understanding your insurance coverage is critical before renting any vehicle.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Basic Coverage:</strong> All vehicles listed on SelfDriveKaro must have valid third-party insurance as required by Indian law</li>
                <li><strong>Optional Insurance:</strong> Some owners may offer additional comprehensive or zero-depreciation insurance for an extra fee</li>
                <li><strong>Customer Responsibility:</strong> You are responsible for any damages not covered by the vehicle's insurance policy</li>
                <li><strong>Deductibles:</strong> Insurance policies may have deductibles; customers may be liable for the deductible amount in case of claims</li>
                <li><strong>Coverage Verification:</strong> We strongly recommend reviewing the insurance coverage details displayed on each vehicle listing before booking</li>
                <li><strong>Personal Insurance:</strong> Check if your personal auto insurance policy extends coverage to rental vehicles</li>
              </ul>
              <p className="mt-3 font-semibold">
                SelfDriveKaro acts as a platform connecting vehicle owners and customers. We do not provide insurance coverage. All insurance is provided by vehicle owners or their insurance providers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Emergency Contact Protocol</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3">In case of emergencies during your rental period, follow these procedures:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Medical Emergency:</strong> Dial 108 (National Ambulance Service) or 102 (State Ambulance Service) immediately</li>
                <li><strong>Police/Crime:</strong> Dial 100 for police assistance</li>
                <li><strong>Fire Emergency:</strong> Dial 101 for fire department</li>
                <li><strong>Accident or Breakdown:</strong> See section 14 below for detailed procedures</li>
                <li><strong>SelfDriveKaro Support:</strong> Contact us through the app's emergency button or call our 24/7 helpline displayed in your booking confirmation</li>
                <li><strong>Vehicle Owner:</strong> Contact the vehicle owner immediately using the contact details provided in your booking confirmation</li>
              </ul>
              <p className="mt-3">
                All bookings include the vehicle owner's emergency contact number. Save this number in your phone before starting your trip. 
                For platform-related emergencies, use the in-app emergency button which will notify both SelfDriveKaro support and the vehicle owner simultaneously.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Breakdown and Accident Procedures</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="mb-3"><strong>In Case of Vehicle Breakdown:</strong></p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Move the vehicle to a safe location if possible</li>
                <li>Turn on hazard lights and place warning triangle (if available) 50 meters behind the vehicle</li>
                <li>Contact the vehicle owner immediately for assistance</li>
                <li>Do not attempt major repairs yourself; wait for authorized assistance</li>
                <li>Document the breakdown with photos and note the time, location, and circumstances</li>
                <li>If breakdown occurs due to owner's negligence (lack of maintenance), customer is entitled to full refund and alternate vehicle arrangement</li>
              </ul>
              
              <p className="mb-3"><strong>In Case of Accident:</strong></p>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li><strong>Ensure Safety:</strong> Check for injuries and call 108 if medical assistance is needed</li>
                <li><strong>Secure the Scene:</strong> Turn on hazard lights, use warning triangle, and prevent further damage</li>
                <li><strong>Call Police:</strong> For any accident involving injury or significant damage, dial 100 to file an FIR (First Information Report)</li>
                <li><strong>Document Everything:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Take photos/videos of all vehicles involved, damage, and accident scene from multiple angles</li>
                    <li>Note down registration numbers of all vehicles involved</li>
                    <li>Collect contact information and insurance details of other parties</li>
                    <li>Get contact details of any witnesses</li>
                    <li>Record date, time, location, and weather conditions</li>
                  </ul>
                </li>
                <li><strong>Notify Immediately:</strong> Contact both the vehicle owner and SelfDriveKaro support within 2 hours of the accident</li>
                <li><strong>Do Not Admit Fault:</strong> Provide only factual information to police and other parties; do not sign any documents without consulting the owner or SelfDriveKaro</li>
                <li><strong>Insurance Claim:</strong> Cooperate fully with insurance company investigations and provide all required documentation</li>
                <li><strong>Vehicle Retrieval:</strong> Coordinate with the owner for vehicle towing and repair; do not abandon the vehicle</li>
              </ol>
              
              <p className="mt-3 font-semibold bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md">
                <strong>Critical:</strong> Failure to report an accident or provide required documentation may result in denial of insurance claims and full liability for all damages, legal costs, and vehicle depreciation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>15. Governing Law</CardTitle>
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
              <CardTitle>16. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                For any questions regarding these Terms and Conditions, please contact us through our Contact Us page 
                or email us at legal@selfdrivekaro.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
