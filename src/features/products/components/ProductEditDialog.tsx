import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../shared/components/ui/form';
import { useToast } from '../../../shared/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Star } from 'lucide-react';
import { updateProduct } from '../services/productService';
import { deleteProduct } from '../services/productService';

const productEditSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  image: z.string().url("Invalid URL"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  details: z.array(z.string()).optional(),
  stockquantity: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid stock format"),
  product_owner_id: z.string().uuid("Invalid UUID format").optional(),
});

type ProductEditForm = z.infer<typeof productEditSchema>;

interface ProductEditDialogProps {
  product: any;
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const productForm = useForm<ProductEditForm>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price?.toString() || '',
      image: product?.image || '',
      description: product?.description || product?.shortDescription || '',
      category: product?.category_id || '',
      rating: product?.rating || 0,
      reviews: product?.reviews || 0,
      badge: product?.badge || '',
      badgeColor: product?.badgeColor || '',
      details: Array.isArray(product?.details) ? product.details : [],
      stockquantity: product?.stockquantity || 0,
      product_owner_id: product?.product_owner_id || '',
    },
  });

  useEffect(() => {
    if (product) {
      productForm.reset({
        name: product.name || '',
        price: product.price?.toString() || '',
        image: product.image || '',
        description: product.description || product.shortDescription || '',
        category: product.category_id || '',
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        badge: product.badge || '',
        badgeColor: product.badgeColor || '',
        details: Array.isArray(product.details) ? product.details : [],
        stockquantity: product.stockquantity || 0,
        product_owner_id: product.product_owner_id || '',
      });
    }
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: ProductEditForm) => {
      return await updateProduct(product.id, {
        name: updatedProduct.name,
        price: parseFloat(updatedProduct.price),
        image: updatedProduct.image,
        description: updatedProduct.description,
        category_id: updatedProduct.category,
        rating: updatedProduct.rating ?? 0,
        reviews: updatedProduct.reviews ?? 0,
        badge: updatedProduct.badge,
        badgeColor: updatedProduct.badgeColor,
        details: updatedProduct.details ? [updatedProduct.details] : [],
        stockquantity: updatedProduct.stockquantity ?? 0,
        product_owner_id: updatedProduct.product_owner_id,
      }, userId);
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      return await deleteProduct(product.id, userId);
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate();
    }
  };

  const onSubmit = (data: ProductEditForm) => {
    const submitData = {
      ...data,
      product_owner_id: data.product_owner_id || product?.product_owner_id,
    };
    updateProductMutation.mutate(submitData);
  };

  const name = productForm.watch('name', '');
  const price = productForm.watch('price', '');
  const image = productForm.watch('image', '');
  const description = productForm.watch('description', '');
  const category = productForm.watch('category', '');
  const stockquantity = productForm.watch('stockquantity', '0');
  const badge = productForm.watch('badge', '');
  const badgeColor = productForm.watch('badgeColor', '');

  const selectedCategory = categories.find((c: any) => c.id === category)?.name || 'Select a category';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-white dark:bg-gray-900">
          <DialogTitle className="text-gray-900 dark:text-white text-xl">Edit Product</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update the product details on the left and preview on the right.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Left Column - Form */}
          <div className="w-1/2 overflow-y-auto pr-2">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-4">
                <TabsTrigger value="basic" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="details" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                  Details
                </TabsTrigger>
              </TabsList>

              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onSubmit)} className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-4 p-4">
                      <FormField
                        control={productForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Product Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter product name" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Image URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/image.jpg" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing" className="space-y-4 p-4">
                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Price</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} placeholder="0.00" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="stockquantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Stock</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} placeholder="0" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-4 p-4">
                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Description</FormLabel>
                            <FormControl>
                              <textarea {...field} placeholder="Enter product description" rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none" />
                            </FormControl>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="badge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Badge</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., New, Sale" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" />
                            </FormControl>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="badgeColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Badge Color</FormLabel>
                            <FormControl>
                              <Input {...field} type="color" className="h-10 w-20 cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                            </FormControl>
                            <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </div>

                  {/* Submit Button - Fixed at bottom */}
                  <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
                      Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium" disabled={deleteProductMutation.isPending}>
                      {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </div>

          {/* Right Column - Preview */}
          <div className="w-1/2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Live Preview</h3>
            <Card className="w-full max-w-sm mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="relative">
                <img
                  src={image || 'https://placehold.co/600x400?text=Product+Image'}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Product+Image';
                  }}
                />
                {selectedCategory && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {selectedCategory}
                  </div>
                )}
                {badge && (
                  <div className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: badgeColor || '#3b82f6' }}>
                    {badge}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{name || 'Product Name'}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < (productForm.watch('rating') || product?.rating || 0) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({productForm.watch('rating') || product?.rating || 0}/5)</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {description || 'Product description will appear here...'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rs {price || '0.00'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Stock: {stockquantity || '0'}
                  </span>
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
