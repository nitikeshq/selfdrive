import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Upload, CheckCircle, FileText, User as UserIcon, Lock, Briefcase, CreditCard, Building2, Image } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import type { UploadResult } from "@uppy/core";

const ObjectUploader = lazy(() => import("@/components/ObjectUploader").then(m => ({ default: m.ObjectUploader })));

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const bankDetailsSchema = z.object({
  bankAccountHolderName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
  upiId: z.string().optional(),
  panNumber: z.string().optional(),
  gstNumber: z.string().optional(),
});

const vendorInfoSchema = z.object({
  isVendor: z.boolean().optional(),
  companyName: z.string().optional(),
});

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>("");

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  // Personal Info Form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    values: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    },
  });

  // Password Form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Bank Details Form
  const bankDetailsForm = useForm<z.infer<typeof bankDetailsSchema>>({
    resolver: zodResolver(bankDetailsSchema),
    values: {
      bankAccountHolderName: profile?.bankAccountHolderName || "",
      bankAccountNumber: profile?.bankAccountNumber || "",
      bankIfscCode: profile?.bankIfscCode || "",
      upiId: profile?.upiId || "",
      panNumber: profile?.panNumber || "",
      gstNumber: profile?.gstNumber || "",
    },
  });

  // Vendor Info Form
  const vendorInfoForm = useForm<z.infer<typeof vendorInfoSchema>>({
    resolver: zodResolver(vendorInfoSchema),
    values: {
      isVendor: profile?.isVendor || false,
      companyName: profile?.companyName || "",
    },
  });

  // Update Personal Info
  const updatePersonalInfoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof personalInfoSchema>) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive",
      });
    },
  });

  // Update Password
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      return await apiRequest("PATCH", "/api/profile", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  // Update Bank Details
  const updateBankDetailsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bankDetailsSchema>) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment details",
        variant: "destructive",
      });
    },
  });

  // Update Vendor Info
  const updateVendorInfoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof vendorInfoSchema> & { companyLogoUrl?: string }) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setCompanyLogoUrl("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      });
    },
  });

  // Upload Documents
  const updateDocumentsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/profile/documents", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setAadharFile(null);
      setDlFile(null);
      setProfilePhotoFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    },
  });

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    if (aadharFile) formData.append("aadhar", aadharFile);
    if (dlFile) formData.append("dl", dlFile);
    if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);

    updateDocumentsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const hasVehicles = user && (user as any).vehicleCount > 0;
  const isOwner = hasVehicles || profile?.isVendor;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white" data-testid="text-profile-title">Edit Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your personal information, documents, and payment details</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="personal">
            <UserIcon className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="owner">
              <Building2 className="h-4 w-4 mr-2" />
              Owner/Vendor
            </TabsTrigger>
          )}
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit((data) => updatePersonalInfoMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalInfoForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalInfoForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={profile?.email || ""} disabled className="bg-gray-50 dark:bg-gray-900" />
                    <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <FormField
                    control={personalInfoForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 9876543210" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={updatePersonalInfoMutation.isPending}
                    data-testid="button-save-personal-info"
                  >
                    {updatePersonalInfoMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-current-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-new-password" />
                        </FormControl>
                        <FormDescription>Must be at least 6 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-confirm-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={updatePasswordMutation.isPending}
                    data-testid="button-change-password"
                  >
                    {updatePasswordMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>KYC Documents</CardTitle>
              <CardDescription>
                Upload your documents once and they'll be automatically used during bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDocumentSubmit} className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Profile Photo</Label>
                    {profile?.profileImageUrl && (
                      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Uploaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)}
                      className="flex-1"
                      data-testid="input-profile-photo"
                    />
                    {profile?.profileImageUrl && (
                      <img
                        src={profile.profileImageUrl}
                        alt="Profile"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Aadhar Card */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Aadhar Card</Label>
                    {profile?.aadharPhotoUrl && (
                      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Uploaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                      className="flex-1"
                      data-testid="input-aadhar"
                    />
                    {profile?.aadharPhotoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.aadharPhotoUrl!, "_blank")}
                        data-testid="button-view-aadhar"
                      >
                        View
                      </Button>
                    )}
                  </div>
                  {profile?.aadharNumber && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Number: {profile.aadharNumber}
                    </p>
                  )}
                </div>

                {/* Driving License */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Driving License</Label>
                    {profile?.dlPhotoUrl && (
                      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Uploaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setDlFile(e.target.files?.[0] || null)}
                      className="flex-1"
                      data-testid="input-dl"
                    />
                    {profile?.dlPhotoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.dlPhotoUrl!, "_blank")}
                        data-testid="button-view-dl"
                      >
                        View
                      </Button>
                    )}
                  </div>
                  {profile?.dlNumber && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Number: {profile.dlNumber}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!aadharFile && !dlFile && !profilePhotoFile || updateDocumentsMutation.isPending}
                  data-testid="button-upload-documents"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {updateDocumentsMutation.isPending ? "Uploading..." : "Upload Documents"}
                </Button>
              </form>

              {/* KYC Status */}
              {profile?.isKycVerified && (
                <div className="mt-6 p-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      Your KYC is verified
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner/Vendor Tab */}
        {isOwner && (
          <TabsContent value="owner">
            <div className="space-y-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Manage your business profile (for rental partners)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...vendorInfoForm}>
                    <form onSubmit={vendorInfoForm.handleSubmit((data) => updateVendorInfoMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={vendorInfoForm.control}
                        name="isVendor"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                                data-testid="checkbox-is-vendor"
                              />
                              <Label className="cursor-pointer">I am a rental partner/business</Label>
                            </div>
                          </FormItem>
                        )}
                      />
                      {vendorInfoForm.watch("isVendor") && (
                        <>
                          <FormField
                            control={vendorInfoForm.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Your Company/Brand Name" data-testid="input-company-name" />
                                </FormControl>
                                <FormDescription>This will be displayed on your vehicle listings</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Company Logo Upload */}
                          <div className="space-y-2">
                            <Label>Company Logo</Label>
                            <div className="flex items-center gap-4">
                              <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
                                <ObjectUploader
                                  maxNumberOfFiles={1}
                                  maxFileSize={2 * 1024 * 1024}
                                  onGetUploadParameters={async () => {
                                    const res = await fetch("/api/objects/upload", {
                                      method: "POST",
                                      credentials: "include",
                                      headers: { "Content-Type": "application/json" },
                                    });
                                    if (!res.ok) throw new Error("Failed to get upload URL");
                                    const data = await res.json();
                                    return { method: "PUT" as const, url: data.uploadURL };
                                  }}
                                  onComplete={(result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                                    if (result.successful && result.successful.length > 0) {
                                      const uploadedUrl = result.successful[0].uploadURL;
                                      setCompanyLogoUrl(uploadedUrl);
                                      updateVendorInfoMutation.mutate({
                                        ...vendorInfoForm.getValues(),
                                        companyLogoUrl: uploadedUrl,
                                      });
                                    }
                                  }}
                                  buttonClassName="w-full md:w-auto"
                                >
                                  <Image className="h-4 w-4 mr-2" />
                                  {profile?.companyLogoUrl || companyLogoUrl ? "Change Logo" : "Upload Logo"}
                                </ObjectUploader>
                              </Suspense>
                              {(profile?.companyLogoUrl || companyLogoUrl) && (
                                <img
                                  src={companyLogoUrl || profile?.companyLogoUrl || ""}
                                  alt="Company Logo"
                                  className="h-16 w-16 rounded object-contain border border-border"
                                />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">Upload your company/brand logo (max 2MB)</p>
                          </div>
                        </>
                      )}
                      <Button 
                        type="submit" 
                        disabled={updateVendorInfoMutation.isPending}
                        data-testid="button-save-company-info"
                      >
                        {updateVendorInfoMutation.isPending ? "Saving..." : "Save Company Info"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                  <CardDescription>Required for receiving rental payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...bankDetailsForm}>
                    <form onSubmit={bankDetailsForm.handleSubmit((data) => updateBankDetailsMutation.mutate(data))} className="space-y-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Bank Account Details</h4>
                        <FormField
                          control={bankDetailsForm.control}
                          name="bankAccountHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Holder Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Full name as per bank" data-testid="input-account-holder-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bankDetailsForm.control}
                            name="bankAccountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="1234567890" data-testid="input-account-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="bankIfscCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IFSC Code</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="SBIN0001234" data-testid="input-ifsc-code" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium">UPI & Tax Details</h4>
                        <FormField
                          control={bankDetailsForm.control}
                          name="upiId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UPI ID</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="yourname@paytm" data-testid="input-upi-id" />
                              </FormControl>
                              <FormDescription>Optional - for instant payments</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={bankDetailsForm.control}
                            name="panNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PAN Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="ABCDE1234F" data-testid="input-pan-number" />
                                </FormControl>
                                <FormDescription>Required for tax purposes</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="gstNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GST Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="22ABCDE1234F1Z5" data-testid="input-gst-number" />
                                </FormControl>
                                <FormDescription>Optional - for registered businesses</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={updateBankDetailsMutation.isPending}
                        data-testid="button-save-payment-details"
                      >
                        {updateBankDetailsMutation.isPending ? "Saving..." : "Save Payment Details"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
