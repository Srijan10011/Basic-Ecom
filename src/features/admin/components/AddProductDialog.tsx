import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../../shared/components/ui/form';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-white dark:bg-gray-900">
          <DialogTitle className="text-gray-900 dark:text-white text-xl">Add New Product</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Fill in the product details using the tabs below.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
            <form onSubmit={productForm.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
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
                <TabsContent value="pricing" className="space-y-4 p-6">
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
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Stock</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} placeholder="0" className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" />
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
                          <textarea {...field} placeholder="Enter product description" rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none" />
                        </FormControl>
                        <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </div>

              {/* Submit Button - Fixed at bottom */}
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
      </DialogContent>
    </Dialog>
  );
}