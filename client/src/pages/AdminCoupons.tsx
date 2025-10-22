import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCouponSchema, type Coupon } from "@shared/schema";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Tag, TrendingUp, Percent, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type CouponFormData = z.infer<typeof insertCouponSchema>;

export default function AdminCoupons() {
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const form = useForm<CouponFormData>({
    resolver: zodResolver(insertCouponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "fixed_amount",
      discountValue: "0",
      maxUsageCount: null,
      isActive: true,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: null,
      minBookingAmount: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CouponFormData) => {
      const response = await apiRequest("POST", "/api/admin/coupons", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      const response = await apiRequest("PATCH", `/api/admin/coupons/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      setEditingCoupon(null);
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/coupons/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });

  const toggleActive = (coupon: Coupon) => {
    updateMutation.mutate({
      id: coupon.id,
      data: { isActive: !coupon.isActive },
    });
  };

  const onSubmit = (data: CouponFormData) => {
    if (editingCoupon) {
      updateMutation.mutate({
        id: editingCoupon.id,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.reset({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType as any,
      discountValue: coupon.discountValue,
      maxUsageCount: coupon.maxUsageCount,
      isActive: coupon.isActive,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : undefined,
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : null,
      minBookingAmount: coupon.minBookingAmount,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCoupon(null);
    form.reset({
      code: "",
      description: "",
      discountType: "fixed_amount",
      discountValue: "0",
      maxUsageCount: null,
      isActive: true,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: null,
      minBookingAmount: null,
    });
    setIsDialogOpen(true);
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "free_hours":
        return <Clock className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const formatDiscountValue = (coupon: Coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% off`;
    } else if (coupon.discountType === "free_hours") {
      return `${coupon.discountValue} hour(s) free`;
    } else {
      return `₹${coupon.discountValue} off`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO
          title="Coupon Management"
          description="Manage promotional coupons for SelfDriveKaro"
        />
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Coupon Management - Admin"
        description="Create and manage promotional discount coupons"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Coupon Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage promotional discount codes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} data-testid="button-create-coupon">
                <Plus className="h-5 w-5 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </DialogTitle>
                <DialogDescription>
                  {editingCoupon
                    ? "Update the coupon details below"
                    : "Enter the details for your new promotional coupon"}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="NEWHOUR"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              data-testid="input-coupon-code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-discount-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed_amount">Fixed Amount (₹)</SelectItem>
                              <SelectItem value="free_hours">Free Hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Get 1 hour free on your booking" data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Value</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="1"
                              data-testid="input-discount-value"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxUsageCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Usage (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="Leave empty for unlimited"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              data-testid="input-max-usage"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="minBookingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Booking Amount (optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="Leave empty for no minimum"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            data-testid="input-min-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid From</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} data-testid="input-valid-from" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                              data-testid="input-valid-until"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Active Status</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable this coupon
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingCoupon(null);
                        form.reset();
                      }}
                      className="flex-1"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                      data-testid="button-save-coupon"
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Saving...
                        </>
                      ) : (
                        editingCoupon ? "Update Coupon" : "Create Coupon"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Coupons</CardTitle>
            <CardDescription>
              Manage promotional discount codes for your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!coupons || coupons.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No coupons yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first promotional coupon to offer discounts to customers
                </p>
                <Button onClick={openCreateDialog} data-testid="button-create-first-coupon">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Coupon
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                      <TableCell className="font-mono font-semibold">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {coupon.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDiscountIcon(coupon.discountType)}
                          <span>{formatDiscountValue(coupon)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {coupon.currentUsageCount}
                          {coupon.maxUsageCount ? ` / ${coupon.maxUsageCount}` : " / ∞"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={coupon.isActive}
                            onCheckedChange={() => toggleActive(coupon)}
                            data-testid={`switch-active-${coupon.id}`}
                          />
                          <Badge variant={coupon.isActive ? "default" : "secondary"}>
                            {coupon.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(coupon)}
                            data-testid={`button-edit-${coupon.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this coupon?")) {
                                deleteMutation.mutate(coupon.id);
                              }
                            }}
                            data-testid={`button-delete-${coupon.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
