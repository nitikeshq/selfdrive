import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Building2, CreditCard, FileText, CheckCircle2, AlertCircle } from "lucide-react";

const paymentDetailsSchema = z.object({
  // Bank Details
  bankAccountHolderName: z.string().min(1, "Account holder name is required"),
  bankAccountNumber: z.string().min(9, "Invalid account number").max(18, "Invalid account number"),
  bankIfscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  
  // UPI
  upiId: z.string().regex(/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/, "Invalid UPI ID").optional().or(z.literal("")),
  
  // PayU Details
  payuVendorId: z.string().optional().or(z.literal("")),
  
  // KYC (PAN required, GST optional)
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number").optional().or(z.literal("")),
});

type PaymentDetailsForm = z.infer<typeof paymentDetailsSchema>;

export default function PaymentDetails() {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm<PaymentDetailsForm>({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: {
      bankAccountHolderName: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      upiId: "",
      payuVendorId: "",
      panNumber: "",
      gstNumber: "",
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        bankAccountHolderName: user.bankAccountHolderName || "",
        bankAccountNumber: user.bankAccountNumber || "",
        bankIfscCode: user.bankIfscCode || "",
        upiId: user.upiId || "",
        payuVendorId: user.payuVendorId || "",
        panNumber: user.panNumber || "",
        gstNumber: user.gstNumber || "",
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: PaymentDetailsForm) => {
      return apiRequest("/api/owner/payment-details", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Payment details updated",
        description: "Your payment information has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment details",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PaymentDetailsForm) => {
    updateMutation.mutate(data);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasPaymentDetails = user?.bankAccountNumber && user?.bankIfscCode && user?.panNumber;
  const isVerified = user?.isPayuVendorVerified;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Payment Details</h1>
        <p className="text-muted-foreground">
          Configure your payment information to receive earnings from bookings
        </p>
      </div>

      {!hasPaymentDetails && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete your payment details to receive earnings from vehicle bookings. 
            You won't be able to receive payments until this information is provided.
          </AlertDescription>
        </Alert>
      )}

      {hasPaymentDetails && isVerified && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your payment details are verified and active. You can receive payments from bookings.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Bank Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Your earnings will be transferred to this bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bankAccountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="As per bank records" 
                        data-testid="input-account-holder-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="1234567890" 
                          data-testid="input-account-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankIfscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="SBIN0001234" 
                          data-testid="input-ifsc-code"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* UPI Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                UPI Details (Optional)
              </CardTitle>
              <CardDescription>
                Alternative payment method for faster transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="upiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI ID</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="yourname@paytm" 
                        data-testid="input-upi-id"
                      />
                    </FormControl>
                    <FormDescription>
                      Your UPI ID (e.g., yourname@paytm, yourname@okaxis)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tax & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tax & Compliance Details
              </CardTitle>
              <CardDescription>
                Required for tax compliance and payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ABCDE1234F" 
                          data-testid="input-pan-number"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Required for tax deduction (TDS)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="22ABCDE1234F1Z5" 
                          data-testid="input-gst-number"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        If you're GST registered
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* PayU Vendor ID (if available) */}
          {user?.payuVendorId && (
            <Card>
              <CardHeader>
                <CardTitle>PayU Vendor Details</CardTitle>
                <CardDescription>
                  Your PayU merchant account for receiving payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="payuVendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PayU Vendor ID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter PayU Vendor ID" 
                          data-testid="input-payu-vendor-id"
                        />
                      </FormControl>
                      <FormDescription>
                        Contact support to get your PayU Vendor ID
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
              data-testid="button-save-payment-details"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Payment Details"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Important Information</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• All earnings will be transferred to your bank account within 7 days after booking completion</li>
          <li>• Platform commission (30%) will be deducted from each booking</li>
          <li>• You'll receive 70% of the booking amount as earnings</li>
          <li>• TDS will be deducted as per Income Tax regulations</li>
          <li>• Keep your bank details updated to avoid payment delays</li>
        </ul>
      </div>
    </div>
  );
}
