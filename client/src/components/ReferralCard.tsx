import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Share2, Copy, Gift, Check } from "lucide-react";

export function ReferralCard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const { user } = useAuth();

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/referral/generate", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Referral Code Generated!",
        description: `Your code: ${data.referralCode}`,
      });
    },
  });

  const applyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/referral/apply", { referralCode: code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      setReferralCodeInput("");
      toast({
        title: "Referral Applied!",
        description: "₹50 has been credited to your friend's wallet!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Apply Code",
        description: error.message || "Invalid or already used referral code",
        variant: "destructive",
      });
    },
  });

  const handleCopyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareText = `Join SelfDriveKaro.com with my referral code ${user?.referralCode} and get ₹50 in your wallet! Book self-drive cars & bikes instantly.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join SelfDriveKaro.com",
          text: shareText,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Link Copied!",
        description: "Share message copied to clipboard",
      });
    }
  };

  const handleApplyCode = () => {
    if (referralCodeInput.trim()) {
      applyCodeMutation.mutate(referralCodeInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Referral Code */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Refer & Earn</CardTitle>
                <CardDescription>Get ₹50 for each friend who signs up</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.referralCode ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Your Referral Code</p>
                  <p className="text-2xl font-bold font-mono" data-testid="text-referral-code">
                    {user.referralCode}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyCode}
                  data-testid="button-copy-code"
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShare}
                  data-testid="button-share-code"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  ✨ Share your code with friends! When they sign up, <strong>₹50</strong> will be credited to your wallet (valid for 90 days).
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You don't have a referral code yet</p>
              <Button
                onClick={() => generateCodeMutation.mutate()}
                disabled={generateCodeMutation.isPending}
                data-testid="button-generate-code"
              >
                <Gift className="h-4 w-4 mr-2" />
                {generateCodeMutation.isPending ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Referral Code */}
      {!user?.referredBy && (
        <Card>
          <CardHeader>
            <CardTitle>Have a Referral Code?</CardTitle>
            <CardDescription>Apply a friend's code to help them earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter referral code"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                className="flex-1"
                data-testid="input-referral-code"
              />
              <Button
                onClick={handleApplyCode}
                disabled={!referralCodeInput.trim() || applyCodeMutation.isPending}
                data-testid="button-apply-code"
              >
                {applyCodeMutation.isPending ? "Applying..." : "Apply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.referredBy && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-900 dark:text-green-100">
                Referral code applied successfully!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
