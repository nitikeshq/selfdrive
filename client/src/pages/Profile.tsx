import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Upload, CheckCircle, FileText, User as UserIcon } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    if (aadharFile) formData.append("aadhar", aadharFile);
    if (dlFile) formData.append("dl", dlFile);
    if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);

    updateProfileMutation.mutate(formData);
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your documents and personal information</p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input 
                  value={profile?.firstName || ""} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-900" 
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input 
                  value={profile?.lastName || ""} 
                  disabled 
                  className="bg-gray-50 dark:bg-gray-900" 
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                value={profile?.email || ""} 
                disabled 
                className="bg-gray-50 dark:bg-gray-900" 
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={profile?.phone || "Not provided"} 
                disabled 
                className="bg-gray-50 dark:bg-gray-900" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Upload your documents once and they'll be automatically used during bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full"
                disabled={!aadharFile && !dlFile && !profilePhotoFile || updateProfileMutation.isPending}
                data-testid="button-upload-documents"
              >
                <Upload className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Uploading..." : "Upload Documents"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* KYC Status */}
        {profile?.isKycVerified && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardContent className="flex items-center gap-2 pt-6">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Your KYC is verified
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
