import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: data.message || "Thank you for contacting us. We'll get back to you within 24 hours.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact Us - SelfDriveKaro.com | Self-Drive Car & Bike Rental Bhubaneswar"
        description="Get in touch with SelfDriveKaro for self-drive car and bike rentals in Bhubaneswar, Odisha. Call us at +91 9337 912331 or visit our office in Patia. 24/7 customer support available."
        keywords="contact selfdrivekaro, car rental bhubaneswar contact, bike rental odisha support, self drive rental customer care, bhubaneswar vehicle rental help"
        ogImage="/og-contact.jpg"
      />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-display font-bold mb-4" data-testid="text-contact-title">
              Contact Us
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a question or need assistance? We're here to help! Reach out to us through any of the following channels.
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <Card className="hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                    <p className="text-muted-foreground mb-2">
                      Send us an email and we'll respond within 24 hours
                    </p>
                    <a href="mailto:support@selfdrivekaro.com" className="text-primary hover:underline">
                      support@selfdrivekaro.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                    <p className="text-muted-foreground mb-2">
                      Speak to our customer support team
                    </p>
                    <a href="tel:+916742123456" className="text-primary hover:underline">
                      +91 674 212 3456
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mon-Sat: 9:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Visit Us</h3>
                    <p className="text-muted-foreground">
                      SelfDriveKaro Office<br />
                      Patia, Bhubaneswar<br />
                      Odisha 751024, India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                      <p>Saturday: 9:00 AM - 6:00 PM</p>
                      <p>Sunday: Closed</p>
                      <p className="text-sm text-primary mt-2">24/7 Emergency Support Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-contact-name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-contact-email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+91 9337 912331"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-contact-phone"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    type="text"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    data-testid="input-contact-subject"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    data-testid="textarea-contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-submit-contact"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What are your operating hours?</h4>
                <p className="text-muted-foreground">
                  Our customer support is available Monday to Saturday from 9:00 AM to 8:00 PM. 
                  For emergencies, we provide 24/7 roadside assistance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How quickly will I receive a response?</h4>
                <p className="text-muted-foreground">
                  We aim to respond to all email inquiries within 24 hours during business days. 
                  Phone support provides immediate assistance during operating hours.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do you provide emergency support?</h4>
                <p className="text-muted-foreground">
                  Yes, we offer 24/7 emergency roadside assistance for all active bookings. 
                  Contact our emergency hotline for immediate help during your rental period.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
