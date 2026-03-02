import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Textarea } from '../../../shared/components/ui/textarea';
import CategorySelector from '../../../shared/components/ui/CategorySelector';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../shared/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { useToast } from '../../../shared/components/ui/use-toast';
import { Upload, Image, Sparkles, Package, DollarSign, FileText, Tag } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { createProduct } from '../services/productService';
// Zod schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  stockquantity: z.string().regex(/^\d+$/, "Stock quantity must be a number"),
  imageUrl: z.string().url("Invalid URL"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  details_text: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

interface AddProductFormProps {
  categories: any[];
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ categories, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("basic");
  const [imagePreview, setImagePreview] = useState<string>("");

  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      stockquantity: '',
      imageUrl: '',
      shortDescription: '',
      description: '',
      categoryId: '',
      rating: 0,
      reviews: 0,
      badge: '',
      badgeColor: '',
      details_text: '',
      
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductForm) => {
      const payload = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description || newProduct.shortDescription || null,
        image: newProduct.imageUrl,
        category_id: newProduct.categoryId,
        rating: newProduct.rating ?? 0,
        reviews: newProduct.reviews ?? 0,
        badge: newProduct.badge,
        badgeColor: newProduct.badgeColor,
        details_text: newProduct.details_text,
        stockquantity: parseInt(newProduct.stockquantity) || 0,
      };

      return await createProduct(payload);
    },
    onSuccess: () => {
      toast({ title: 'Product added', description: 'New product has been added successfully.' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      productForm.reset();
      onClose();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add product. Please try again.', variant: 'destructive' });
    }
  });

  const onSubmitProduct = (data: ProductForm) => {
    addProductMutation.mutate(data);
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    productForm.setValue('imageUrl', url);
  };

  const isBasicComplete = productForm.watch('name') && productForm.watch('categoryId') && productForm.watch('price');
  const isDetailsComplete = productForm.watch('shortDescription') && productForm.watch('description');
  const isInventoryComplete = productForm.watch('stockquantity') && productForm.watch('imageUrl');

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Add New Product
        </h2>
        <p className="text-gray-600 mt-2">Create an amazing product that your customers will love</p>
      </div>

      <Form {...productForm}>
        <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-8">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Basic Info
                {isBasicComplete && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Details
                {isDetailsComplete && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Media & Stock
                {isInventoryComplete && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Package className="w-5 h-5 text-blue-600" />
                    Product Essentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Product Name *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter an amazing product name"
                              className="h-12 text-lg border-2 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Category *</FormLabel>
                          <FormControl>
                            <CategorySelector
                              categories={categories?.map(cat => ({ id: cat.id, name: cat.name })) || []}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Choose a category"
                              className="h-12 text-lg border-2 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={productForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Price *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              placeholder="0.00"
                              className="h-12 text-lg pl-10 border-2 focus:border-blue-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={productForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Rating</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              min="0" 
                              max="5" 
                              {...field} 
                              placeholder="e.g., 4.5"
                              className="h-12 text-lg border-2 focus:border-blue-500"
                            />
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
                          <FormLabel className="text-sm font-semibold text-gray-700">Number of Reviews</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field} 
                              placeholder="e.g., 120"
                              className="h-12 text-lg border-2 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={productForm.control}
                      name="badge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Badge Text</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., New, Sale, Limited"
                              className="h-12 text-lg border-2 focus:border-blue-500"
                            />
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
                          <FormLabel className="text-sm font-semibold text-gray-700">Badge Color</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., red, #FF0000"
                              className="h-12 text-lg border-2 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-5 h-5 text-green-600" />
                    Product Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={productForm.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Short Description</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="A catchy one-liner about your product"
                            className="h-12 text-lg border-2 focus:border-green-500"
                          />
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
                        <FormLabel className="text-sm font-semibold text-gray-700">Full Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell your customers everything they need to know about this amazing product..."
                            className="min-h-[120px] text-lg border-2 focus:border-green-500 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={productForm.control}
                    name="details_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Product Details Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Provide additional detailed information about the product..."
                            className="min-h-[120px] text-lg border-2 focus:border-green-500 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory & Media Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Upload */}
                <Card className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Image className="w-5 h-5 text-purple-600" />
                      Product Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={productForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Image URL *</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Input 
                                {...field} 
                                placeholder="https://example.com/image.jpg"
                                className="h-12 text-lg border-2 focus:border-purple-500"
                                onChange={(e) => handleImageUrlChange(e.target.value)}
                              />
                              {imagePreview && (
                                <div className="relative">
                                  <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                    onError={() => setImagePreview("")}
                                  />
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    ✓ Looks great!
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Stock Information */}
                <Card className="border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Package className="w-5 h-5 text-orange-600" />
                      Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={productForm.control}
                      name="stockquantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Stock Quantity *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              placeholder="How many do you have?"
                              className="h-12 text-lg border-2 focus:border-orange-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex gap-2">
              {currentTab !== "basic" && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (currentTab === "details") setCurrentTab("basic");
                    if (currentTab === "inventory") setCurrentTab("details");
                  }}
                  className="h-12 px-6"
                >
                  ← Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-12 px-6"
              >
                Cancel
              </Button>
              
              {currentTab !== "inventory" ? (
                <Button 
                  type="button" 
                  onClick={() => {
                    if (currentTab === "basic") setCurrentTab("details");
                    if (currentTab === "details") setCurrentTab("inventory");
                  }}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next →
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={addProductMutation.isPending}
                  className="h-12 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {addProductMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Product
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddProductForm;