import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../../shared/components/ui/form';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Star, Package, DollarSign } from 'lucide-react';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productForm: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  categories?: any[];
}

export default function AddProductDialog({
  open,
  onOpenChange,
  productForm,
  onSubmit,
  categories = [],
}: AddProductDialogProps) {
  const name = productForm.watch('name', '');
  const price = productForm.watch('price', '');
  const image = productForm.watch('image', '');
  const description = productForm.watch('description', '');
  const category = productForm.watch('category', '');
  const stockquantity = productForm.watch('stockquantity', '0');

  const selectedCategory = categories.find((c: any) => c.id === category)?.name || 'Select a category';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-white dark:bg-gray-900">
          <DialogTitle className="text-gray-900 dark:text-white text-xl">Add New Product</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Fill in the product details on the left and preview on the right.
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
                    </TabsContent>
                  </div>

                  {/* Submit Button - Fixed at bottom */}
                  <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium">
                      Add Product
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
                      Cancel
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
                {name && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {selectedCategory}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{name || 'Product Name'}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">(12)</span>
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
}