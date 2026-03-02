
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

import { updateProduct } from '../services/productService';
// Zod schema for product editing
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
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
  product,
  categories,
  isOpen,
  onClose,
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
      product_owner_id: product?.product_owner_id || '', // Initialize with existing value
    },
  });

  // Update product mutation
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
      });
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
    updateProductMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Update the product details below and click Save Changes.
          </DialogDescription>
        </DialogHeader>
        <Form {...productForm}>
          <form onSubmit={productForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="stockquantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Rating</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" max="5" {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="reviews"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Number of Reviews</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Badge Text</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="badgeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Badge Color</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="product_owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">Product Owner ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter UUID of product owner" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={productForm.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={productForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={productForm.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">Product Details (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      rows={2}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} className="dark:text-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;