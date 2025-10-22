import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  HelpCircle,
  Search,
  BookOpen,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Support() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/contact", formData);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try another contact method.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Customer Support - DriveEase Help Center"
        description="Get help with your DriveEase bookings. Contact us via phone, email, or WhatsApp. We're here to assist you 24/7 with your vehicle rental needs."
        canonical="https://driveease.in/support"
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4 dark:text-white" data-testid="text-support-title">
            How Can We Help You?
          </h1>
          <p className="text-lg text-muted-foreground">
            Our support team is available 24/7 to assist you with any questions or concerns
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover-elevate transition-all border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-4">Quick responses via chat</p>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-whatsapp-support"
              >
                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                  +91 98765 43210
                </Button>
              </a>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">Available 24/7</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-sm text-muted-foreground mb-4">Detailed inquiries welcome</p>
              <a 
                href="mailto:support@driveease.in"
                data-testid="link-email-support"
              >
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  support@driveease.in
                </Button>
              </a>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">Always Active</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all border-orange-200 dark:border-orange-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-sm text-muted-foreground mb-4">Speak to our team directly</p>
              <a 
                href="tel:+919876543210"
                data-testid="link-phone-support"
              >
                <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  +91 98765 43210
                </Button>
              </a>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-2">9 AM - 7 PM Daily</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="mb-12 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Emergency Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  For urgent issues like accidents, breakdowns, or emergencies during your rental, you can call us anytime at{" "}
                  <a href="tel:+919876543210" className="font-semibold text-red-600 dark:text-red-400 hover:underline">
                    +91 98765 43210
                  </a>
                  {" "}— even outside regular hours.
                </p>
                <p className="text-xs text-muted-foreground">
                  Regular support hours: 9 AM - 7 PM • Emergency support: Available 24/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                      data-testid="input-subject"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your issue or question..."
                      rows={5}
                      required
                      data-testid="textarea-message"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-support">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">What are your booking hours?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can book vehicles on our website 24/7. WhatsApp and email support are always active. Phone support is available from 9 AM to 7 PM daily, with emergency calls accepted anytime.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How do I modify my booking?</h4>
                  <p className="text-sm text-muted-foreground">
                    Log into your account and visit "My Bookings" to modify or cancel your reservation. You can also contact us via WhatsApp or phone for assistance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What if I have an emergency during rental?</h4>
                  <p className="text-sm text-muted-foreground">
                    Call us immediately at +91 98765 43210. Our emergency line is available 24/7 for accidents, breakdowns, or urgent issues during your rental period.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How long does it take to get a response?</h4>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp and phone: Usually within minutes during business hours. Email: Within 24 hours. Emergency calls: Immediate response anytime.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What documents do I need?</h4>
                  <p className="text-sm text-muted-foreground">
                    You need a valid driving license, Aadhar card, and a profile photo. All documents can be uploaded through your account dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Phone Support</span>
                  <span className="text-sm text-muted-foreground">9 AM - 7 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">WhatsApp & Email</span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">24/7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Website Booking</span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">24/7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Emergency Line</span>
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">24/7</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
