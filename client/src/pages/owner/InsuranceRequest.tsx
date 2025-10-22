import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsuranceRequest, Vehicle } from "@shared/schema";
import { insertInsuranceRequestSchema } from "@shared/schema";
import { Shield, Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Validation schema for insurance request form
const formSchema = insertInsuranceRequestSchema.extend({
  insuranceType: z.enum(["comprehensive", "third_party", "zero_depreciation"], {
    required_error: "Please select an insurance type",
  }),
  coverageAmount: z.coerce
    .number({
      required_error: "Coverage amount is required",
      invalid_type_error: "Coverage amount must be a number",
    })
    .positive("Coverage amount must be greater than 0")
    .min(1000, "Coverage amount must be at least ₹1,000"),
  requestReason: z
    .string()
    .min(10, "Please provide at least 10 characters explaining your insurance needs")
    .max(500, "Request reason must be less than 500 characters"),
  vehicleId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InsuranceRequestPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: undefined,
      insuranceType: "comprehensive",
      coverageAmount: 0,
      requestReason: "",
    },
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/owner/vehicles"],
  });

  const { data: requests, isLoading: requestsLoading } = useQuery<InsuranceRequest[]>({
    queryKey: ["/api/owner/insurance-requests"],
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/insurance-requests", {
        ...data,
        coverageAmount: data.coverageAmount.toString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Insurance request submitted successfully. We'll contact you soon." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/insurance-requests"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to submit insurance request", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (values: FormValues) => {
    createRequestMutation.mutate(values);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 dark:bg-yellow-600" data-testid={`status-${status}`}><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500 dark:bg-green-600" data-testid={`status-${status}`}><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" data-testid={`status-${status}`}><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "contacted":
        return <Badge className="bg-blue-500 dark:bg-blue-600" data-testid={`status-${status}`}><AlertCircle className="h-3 w-3 mr-1" /> Contacted</Badge>;
      default:
        return <Badge data-testid={`status-${status}`}>{status}</Badge>;
    }
  };

  const getVehicleName = (vehicleId: string | null) => {
    if (!vehicleId || !vehicles) return "All Vehicles";
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : "Unknown Vehicle";
  };

  if (vehiclesLoading || requestsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 dark:text-white" data-testid="text-insurance-title">
              Insurance Requests
            </h1>
            <p className="text-muted-foreground">Request insurance coverage for your vehicles</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-new-request">
                <Plus className="h-5 w-5 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Insurance Coverage</DialogTitle>
                <DialogDescription>
                  Submit a request to get insurance coverage for your vehicle. Our team will contact you with quotes and options.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-vehicle">
                              <SelectValue placeholder="Select vehicle (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All Vehicles</SelectItem>
                            {vehicles?.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.brand} {vehicle.model} ({vehicle.registrationNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Leave blank if you want general insurance information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insuranceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-insurance-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="comprehensive">Comprehensive</SelectItem>
                            <SelectItem value="third_party">Third Party</SelectItem>
                            <SelectItem value="zero_depreciation">Zero Depreciation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coverageAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coverage Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 500000"
                            data-testid="input-coverage-amount"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Desired coverage amount in ₹
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Reason</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your insurance needs..."
                            rows={4}
                            data-testid="textarea-request-reason"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createRequestMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg dark:text-white">Why Get Insurance?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Protect your vehicle against accidents and damages</li>
              <li>Cover repair costs and third-party liability</li>
              <li>Increase customer trust with insured vehicles</li>
              <li>Comply with legal requirements for commercial rentals</li>
              <li>Peace of mind when renting out your vehicles</li>
            </ul>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white">Your Requests</h2>
          
          {requests && requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No insurance requests yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "New Request" to submit your first insurance request
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests?.map((request) => (
                <Card key={request.id} className="hover-elevate transition-all" data-testid={`card-request-${request.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg dark:text-white">{getVehicleName(request.vehicleId)}</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          {request.insuranceType.replace('_', ' ').toUpperCase()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {request.coverageAmount && (
                        <div>
                          <p className="font-semibold dark:text-white">Coverage Amount:</p>
                          <p className="text-muted-foreground">₹{parseFloat(request.coverageAmount).toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold dark:text-white">Requested On:</p>
                        <p className="text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {request.requestReason && (
                        <div className="md:col-span-2">
                          <p className="font-semibold dark:text-white">Reason:</p>
                          <p className="text-muted-foreground">{request.requestReason}</p>
                        </div>
                      )}
                      {request.adminNotes && (
                        <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="font-semibold text-blue-700 dark:text-blue-300">Admin Response:</p>
                          <p className="text-blue-600 dark:text-blue-400">{request.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
