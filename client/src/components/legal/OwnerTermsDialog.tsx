import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import OwnerTerms from "./OwnerTerms";

interface OwnerTermsDialogProps {
  open: boolean;
  onAccepted: () => void;
}

export default function OwnerTermsDialog({ open, onAccepted }: OwnerTermsDialogProps) {
  const { toast } = useToast();
  const [digitalSignature, setDigitalSignature] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/agreement-acceptances", {
        agreementType: "owner_terms",
        digitalSignature,
      });
    },
    onSuccess: () => {
      toast({
        title: "Terms Accepted",
        description: "You can now list your vehicles on DriveEase.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agreement-acceptances/check/owner_terms"] });
      onAccepted();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept terms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    if (!digitalSignature.trim()) {
      toast({
        title: "Signature Required",
        description: "Please type your full name as digital signature.",
        variant: "destructive",
      });
      return;
    }

    if (!confirmChecked) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that you have read and accept the terms.",
        variant: "destructive",
      });
      return;
    }

    acceptMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl">Owner Terms & Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept the terms before listing your vehicles
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <OwnerTerms />
        </div>

        <div className="border-t p-6 space-y-4 bg-muted/30 flex-shrink-0">
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">Important</p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  By accepting these terms, you agree to the 30% platform commission and 7-day payment settlement period. 
                  Your earnings (70% of booking amount) will be transferred to your registered account within 7 business days after vehicle return.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Digital Signature (Type your full name)</Label>
            <Input
              id="signature"
              data-testid="input-signature"
              placeholder="Type your full name exactly as it appears on your ID"
              value={digitalSignature}
              onChange={(e) => setDigitalSignature(e.target.value)}
              className="font-serif text-lg"
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="confirm"
              data-testid="checkbox-confirm-terms"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
            />
            <Label htmlFor="confirm" className="text-sm cursor-pointer">
              I confirm that I have read, understood, and agree to all the terms and conditions stated above. 
              I accept the 30% platform commission and 7-day payment settlement period.
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              data-testid="button-accept-terms"
              onClick={handleAccept}
              disabled={acceptMutation.isPending || !digitalSignature.trim() || !confirmChecked}
              className="flex-1"
            >
              {acceptMutation.isPending ? (
                "Accepting..."
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept Terms & Continue
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This is a legally binding agreement. By accepting, you acknowledge that you understand all terms.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
