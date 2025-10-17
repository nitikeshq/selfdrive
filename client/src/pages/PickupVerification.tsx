import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ObjectUploader } from "@/components/ObjectUploader";
import RentalAgreement from "@/components/legal/RentalAgreement";
import { AlertCircle, Video, FileText, CheckCircle2, Upload } from "lucide-react";
import type { BookingWithDetails, User } from "@shared/schema";

export default function PickupVerification() {
  const [, params] = useRoute("/pickup-verification/:bookingId");
  const bookingId = params?.bookingId;
  const { toast } = useToast();

  const [ownerSignature, setOwnerSignature] = useState("");
  const [customerSignature, setCustomerSignature] = useState("");
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [customerConfirmed, setCustomerConfirmed] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [step, setStep] = useState<"agreement" | "video" | "complete">("agreement");

  // Fetch booking details
  const { data: booking, isLoading } = useQuery<BookingWithDetails>({
    queryKey: ["/api/bookings", bookingId],
    enabled: !!bookingId,
  });

  // Fetch owner details
  const { data: owner } = useQuery<User>({
    queryKey: ["/api/users", booking?.vehicle?.ownerId],
    enabled: !!booking?.vehicle?.ownerId,
  });

  // Fetch customer details (if not guest)
  const { data: customer } = useQuery<User>({
    queryKey: ["/api/users", booking?.userId],
    enabled: !!booking?.userId,
  });

  const acceptAgreementMutation = useMutation({
    mutationFn: async () => {
      // Create agreement acceptances for both parties
      await apiRequest("POST", "/api/agreement-acceptances", {
        agreementType: "rental_agreement",
        bookingId,
        digitalSignature: ownerSignature,
      });

      if (booking?.userId) {
        // For registered customers, create their acceptance
        await apiRequest("POST", "/api/agreement-acceptances", {
          agreementType: "rental_agreement",
          bookingId,
          digitalSignature: customerSignature,
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Agreement Signed",
        description: "Both parties have signed the rental agreement.",
      });
      setStep("video");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record agreement signatures.",
        variant: "destructive",
      });
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async () => {
      if (!videoUrl) {
        throw new Error("Video URL is required");
      }

      await apiRequest("POST", "/api/video-verifications", {
        bookingId,
        videoUrl,
        uploadedBy: "owner", // In production, determine based on who uploaded
      });

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pickup verification completed successfully!",
      });
      setStep("complete");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload video verification.",
        variant: "destructive",
      });
    },
  });

  const handleVideoUpload = (result: any) => {
    if (result.successful && result.successful[0]) {
      const uploadedUrl = result.successful[0].uploadURL;
      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
        toast({
          title: "Video Uploaded",
          description: "Vehicle condition video has been uploaded.",
        });
      }
    }
  };

  const handleSignAgreement = () => {
    if (!ownerSignature.trim()) {
      toast({
        title: "Owner Signature Required",
        description: "Owner must sign the agreement.",
        variant: "destructive",
      });
      return;
    }

    if (booking?.userId && !customerSignature.trim()) {
      toast({
        title: "Customer Signature Required",
        description: "Customer must sign the agreement.",
        variant: "destructive",
      });
      return;
    }

    if (!ownerConfirmed || (booking?.userId && !customerConfirmed)) {
      toast({
        title: "Confirmation Required",
        description: "Both parties must confirm agreement.",
        variant: "destructive",
      });
      return;
    }

    acceptAgreementMutation.mutate();
  };

  const handleCompleteVerification = () => {
    if (!videoUrl) {
      toast({
        title: "Video Required",
        description: "Please upload vehicle condition video.",
        variant: "destructive",
      });
      return;
    }

    uploadVideoMutation.mutate();
  };

  if (isLoading || !booking || !owner) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Vehicle Pickup Verification</CardTitle>
          <p className="text-muted-foreground">
            Complete rental agreement and video verification before vehicle handover
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 ${step === "agreement" ? "text-blue-600" : "text-green-600"}`}>
              <FileText className="h-5 w-5" />
              <span className="font-medium">1. Agreement</span>
              {step !== "agreement" && <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div className="h-0.5 w-12 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step === "video" ? "text-blue-600" : step === "complete" ? "text-green-600" : "text-gray-400"}`}>
              <Video className="h-5 w-5" />
              <span className="font-medium">2. Video</span>
              {step === "complete" && <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div className="h-0.5 w-12 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step === "complete" ? "text-green-600" : "text-gray-400"}`}>
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">3. Complete</span>
            </div>
          </div>

          {/* Step 1: Rental Agreement */}
          {step === "agreement" && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Both owner and customer must read and sign the rental agreement before proceeding.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[400px] border rounded-lg p-6">
                <RentalAgreement
                  booking={booking}
                  vehicle={booking.vehicle}
                  owner={owner}
                  customer={customer || null}
                  guestName={booking.guestName || undefined}
                />
              </ScrollArea>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Owner Signature</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="owner-signature">Type your full name</Label>
                      <Input
                        id="owner-signature"
                        data-testid="input-owner-signature"
                        placeholder="Owner full name"
                        value={ownerSignature}
                        onChange={(e) => setOwnerSignature(e.target.value)}
                        className="font-serif text-lg"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="owner-confirm"
                        data-testid="checkbox-owner-confirm"
                        checked={ownerConfirmed}
                        onCheckedChange={(checked) => setOwnerConfirmed(checked as boolean)}
                      />
                      <Label htmlFor="owner-confirm" className="text-sm cursor-pointer">
                        I confirm the vehicle condition and agree to all terms
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Signature</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="customer-signature">Type your full name</Label>
                      <Input
                        id="customer-signature"
                        data-testid="input-customer-signature"
                        placeholder="Customer full name"
                        value={customerSignature}
                        onChange={(e) => setCustomerSignature(e.target.value)}
                        className="font-serif text-lg"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="customer-confirm"
                        data-testid="checkbox-customer-confirm"
                        checked={customerConfirmed}
                        onCheckedChange={(checked) => setCustomerConfirmed(checked as boolean)}
                      />
                      <Label htmlFor="customer-confirm" className="text-sm cursor-pointer">
                        I confirm the vehicle condition and agree to all terms
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={handleSignAgreement}
                disabled={acceptAgreementMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-sign-agreement"
              >
                {acceptAgreementMutation.isPending ? "Processing..." : "Sign Agreement & Continue"}
              </Button>
            </>
          )}

          {/* Step 2: Video Verification */}
          {step === "video" && (
            <>
              <Alert>
                <Video className="h-4 w-4" />
                <AlertDescription>
                  Upload a video showing the vehicle's condition, fuel level, odometer reading, and any existing damages.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Vehicle Condition Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={50 * 1024 * 1024}
                    onGetUploadParameters={async () => {
                      const response = await apiRequest("POST", "/api/objects/upload", {});
                      const data = await response.json();
                      return { method: "PUT" as const, url: data.uploadURL };
                    }}
                    onComplete={handleVideoUpload}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Vehicle Condition Video
                  </ObjectUploader>

                  {videoUrl && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Video uploaded successfully</span>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Video Recording Guidelines:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Show all sides of the vehicle (front, back, left, right)</li>
                      <li>• Record odometer reading clearly</li>
                      <li>• Show fuel gauge level</li>
                      <li>• Document any existing scratches, dents, or damages</li>
                      <li>• Record interior condition</li>
                      <li>• Keep video under 2 minutes</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleCompleteVerification}
                disabled={!videoUrl || uploadVideoMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-complete-verification"
              >
                {uploadVideoMutation.isPending ? "Completing..." : "Complete Pickup Verification"}
              </Button>
            </>
          )}

          {/* Step 3: Complete */}
          {step === "complete" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-6">
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Pickup Verification Complete!</h3>
                <p className="text-muted-foreground">
                  The rental agreement has been signed and vehicle condition has been recorded.
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Important:</strong> The same verification process must be completed at vehicle return. 
                  Both parties must approve the return video before the rental is marked complete.
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/'}
                size="lg"
                data-testid="button-go-home"
              >
                Return to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
