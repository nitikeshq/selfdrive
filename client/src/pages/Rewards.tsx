import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { format } from "date-fns";
import type { WalletTransaction } from "@shared/schema";

export default function Rewards() {
  const { data: balanceData } = useQuery<{ balance: number }>({
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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-rewards-title">
            My Rewards
          </h1>
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
              ₹{balanceData?.balance?.toFixed(2) || "0.00"}
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
    </div>
  );
}
