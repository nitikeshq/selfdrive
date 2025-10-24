import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Crown, Check, Clock, Truck, Shield, Gift, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import type { WalletTransaction } from "@shared/schema";

interface MembershipStatus {
  isActive: boolean;
  expiresAt?: string;
  purchasedAt?: string;
}

export default function Membership() {
  const { toast } = useToast();
  const paymentFormRef = useRef<HTMLFormElement>(null);

  const { data: membershipStatus } = useQuery<MembershipStatus>({
    queryKey: ["/api/membership/status"],
  });

  const { data: rewardsData } = useQuery<{ balance: number }>({
    queryKey: ["/api/wallet/balance"],
  });

  const { data: transactions = [] } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/wallet/transactions"],
  });

  // Calculate expiring credits (within 7 days)
  const expiringCredits = transactions.filter(t => {
    if (!t.expiresAt || t.type !== "credit") return false;
    const expiryDate = new Date(t.expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  });

  const expiringAmount = expiringCredits.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/membership/purchase", { paymentMethod: "payu" });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.paymentUrl) {
        // PayUMoney payment - create and submit form
        const form = paymentFormRef.current;
        if (form) {
          // Clear existing inputs
          form.innerHTML = '';
          
          // Add all payment fields
          Object.entries(data).forEach(([key, value]) => {
            if (key !== 'paymentUrl') {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = String(value);
              form.appendChild(input);
            }
          });
          
          form.action = data.paymentUrl;
          form.method = 'POST';
          form.submit();
        }
      } else {
        // Wallet payment success
        queryClient.invalidateQueries({ queryKey: ["/api/membership/status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({
          title: "Membership Activated!",
          description: "You now have access to all premium benefits.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase membership",
        variant: "destructive",
      });
    },
  });

  // Check for payment status in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      queryClient.invalidateQueries({ queryKey: ["/api/membership/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Membership Activated!",
        description: "You now have access to all premium benefits.",
      });
      // Clean URL
      window.history.replaceState({}, '', '/membership');
    } else if (paymentStatus === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your membership purchase was not completed.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/membership');
    }
  }, [toast]);

  const benefits = [
    {
      icon: Truck,
      title: "Free Delivery & Pickup",
      description: "For all day-wise bookings (24 hours or more)",
    },
    {
      icon: Clock,
      title: "30-Minute Late Fee Waiver",
      description: "For bookings under 8 hours - never worry about small delays",
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "Get faster responses from our support team",
    },
    {
      icon: Crown,
      title: "Member Badge",
      description: "Show your premium status across the platform",
    },
  ];

  const hasActiveMembership = membershipStatus?.isActive;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-12 w-12 text-yellow-500" />
            <h1 className="text-3xl sm:text-4xl font-display font-bold" data-testid="text-membership-title">
              SelfDriveKaro Premium
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Unlock exclusive benefits for just ₹999/year
          </p>
        </div>

        {/* Current Membership Status */}
        {hasActiveMembership && (
          <Card className="mb-8 border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  <div>
                    <CardTitle>Active Membership</CardTitle>
                    <CardDescription>You're a premium member</CardDescription>
                  </div>
                </div>
                <Badge className="bg-yellow-500 text-white" data-testid="badge-member">
                  Member
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {membershipStatus?.purchasedAt && (
                  <p className="text-sm text-muted-foreground">
                    Activated on: {format(new Date(membershipStatus.purchasedAt), "MMM dd, yyyy")}
                  </p>
                )}
                {membershipStatus?.expiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Valid until: {format(new Date(membershipStatus.expiresAt), "MMM dd, yyyy")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {benefits.map((benefit, i) => (
            <Card key={i} className="hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase Section */}
        {!hasActiveMembership && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Get Premium Membership</CardTitle>
              <CardDescription>Choose your payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6">
                <p className="text-4xl font-bold text-primary mb-2">₹999</p>
                <p className="text-muted-foreground">per year</p>
              </div>

              {/* Rewards Discount Info */}
              {rewardsData && rewardsData.balance > 0 && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Rewards Applied!</strong> Your ₹{Math.min(rewardsData.balance, 999).toFixed(2)} rewards will be automatically deducted.
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                    Final Amount: ₹{Math.max(0, 999 - rewardsData.balance).toFixed(2)}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
                data-testid="button-purchase-membership"
              >
                <Crown className="h-5 w-5 mr-2" />
                {purchaseMutation.isPending ? "Redirecting to Payment..." : "Activate Membership"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>✓ One-time payment of ₹999</p>
                <p>✓ Valid for 365 days</p>
                <p>✓ Instant activation</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewards Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              My Rewards
            </h2>
            <p className="text-muted-foreground">View your rewards balance and transaction history</p>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Rewards Balance</CardTitle>
                  <CardDescription>Available rewards credits</CardDescription>
                </div>
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-4" data-testid="text-wallet-balance">
                ₹{rewardsData?.balance?.toFixed(2) || "0.00"}
              </div>
              {expiringAmount > 0 && (
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <Clock className="h-4 w-4" />
                  <span>₹{expiringAmount.toFixed(2)} expiring within 7 days</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent rewards transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center gap-4">
                        {transaction.type === "credit" ? (
                          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium" data-testid={`transaction-description-${transaction.id}`}>
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(transaction.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                            {transaction.expiresAt && (
                              <Badge variant="outline" className="text-xs">
                                Expires {format(new Date(transaction.expiresAt), "MMM dd, yyyy")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          transaction.type === "credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}  data-testid={`transaction-amount-${transaction.id}`}>
                          {transaction.type === "credit" ? "+" : "-"}₹{parseFloat(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: ₹{parseFloat(transaction.balanceAfter).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hidden PayUMoney payment form */}
        <form ref={paymentFormRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
