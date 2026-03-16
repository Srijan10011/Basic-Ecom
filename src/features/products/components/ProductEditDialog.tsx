import { useForm } from 'react-hook-form';
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
import { updateProduct } from '../services/productService';

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
  stockquantity: z.number().int().min(0).optional(),
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

  const onSubmit = (data: ProductEditForm) => {
  console.log("Form submitted with data:", data);
  // Don't send empty product_owner_id
  const submitData = {
    ...data,
    product_owner_id: data.product_owner_id || product?.product_owner_id,
  };
  updateProductMutation.mutate(submitData);
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-white dark:bg-gray-900">
          <DialogTitle className="text-gray-900 dark:text-white text-xl">Edit Product</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update the product details below and click Save Changes.
          </DialogDescription>
        </DialogHeader>

        <Form {...productForm}>
          <form onSubmit={productForm.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="basic" className="w-full flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TabsTrigger value="basic" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                  Pricing & Stock
                </TabsTrigger>
                <TabsTrigger value="details" className="text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                  Details
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 p-6">
                  <FormField
                    control={productForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
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
                            {categories?.map((category) => (
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
                          <Input {...field} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Pricing & Stock Tab */}
                <TabsContent value="pricing" className="space-y-4 p-6">
                  <FormField
                    control={productForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
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
                        <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4 p-6">
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 resize-none" />
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
                          <Input {...field} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
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
                          <Input {...field} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Submit Button - Outside Tabs, Inside Form */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium">
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
