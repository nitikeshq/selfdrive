import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AddonProduct } from "@shared/schema";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminAddons() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AddonProduct | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "insurance",
    price: "",
    imageUrl: "",
  });

  const { data: products, isLoading } = useQuery<AddonProduct[]>({
    queryKey: ["/api/addon-products"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/addon-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/addon-products"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AddonProduct> }) => {
      const response = await fetch(`/api/addon-products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/addon-products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/addon-products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/addon-products"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "insurance",
      price: "",
      imageUrl: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleEdit = (product: AddonProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const toggleActive = (product: AddonProduct) => {
    updateProductMutation.mutate({
      id: product.id,
      data: { isActive: !product.isActive },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Addon Products</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage marketplace products for vehicle owners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update product details" : "Create a new addon product for owners to purchase"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="GPS Tracking Device"
                  required
                  data-testid="input-product-name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="High-quality GPS tracker with real-time location updates"
                  required
                  data-testid="input-product-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="gps">GPS Tracking</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="safety">Safety Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2999.00"
                    required
                    data-testid="input-product-price"
                  />
                </div>
              </div>
              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/product-image.jpg"
                  data-testid="input-product-image"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending} data-testid="button-save-product">
                  {editingProduct ? "Update" : "Create"} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Card key={product.id} className={!product.isActive ? "opacity-60" : ""} data-testid={`card-product-${product.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {product.name}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{product.category}</span>
                <span className="text-2xl font-bold text-primary">₹{product.price}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(product)}
                  data-testid={`button-edit-${product.id}`}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={product.isActive ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => toggleActive(product)}
                  data-testid={`button-toggle-${product.id}`}
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this product?")) {
                      deleteProductMutation.mutate(product.id);
                    }
                  }}
                  data-testid={`button-delete-${product.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products?.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-4">No addon products yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first product to get started</p>
        </Card>
      )}
    </div>
  );
}
