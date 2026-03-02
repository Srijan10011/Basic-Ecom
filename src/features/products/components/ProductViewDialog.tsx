import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Star, Package, Tag, Image as ImageIcon } from 'lucide-react';

interface ProductViewDialogProps {
  product: any;
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
}

const ProductViewDialog: React.FC<ProductViewDialogProps> = ({
  product,
  categories,
  isOpen,
  onClose,
}) => {
  if (!product) return null;

  const categoryName = categories?.find(cat => cat.id === product.category_id)?.name || 'Unknown Category';
  const productImage = product.image || '/placeholder-product.jpg';
  const productDescription = product.description || product.shortDescription || 'No description available';
  const productDetails = Array.isArray(product.details) ? product.details : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Product Details</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Complete information about {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="bg-white dark:bg-gray-700">
              <CardContent className="p-4">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-600">
                  <img 
                    src={productImage} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Badge Information */}
            {product.badge && (
              <Card className="bg-white dark:bg-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Badge:</span>
                    <Badge 
                      style={{ backgroundColor: product.badgeColor || '#3B82F6' }}
                      className="text-white"
                    >
                      {product.badge}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Product Information */}
          <div className="space-y-4">
            <Card className="bg-white dark:bg-gray-700">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Category: {categoryName}</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Rs {parseFloat(product.price || 0).toFixed(2)}
                  </p>
                </div>
                
                {/* Rating and Reviews */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.rating || 0} ({product.reviews || 0} reviews)
                    </span>
                  </div>
                </div>
                
                {/* Stock Information */}
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Stock: {product.stockQuantity || 0} units
                  </span>
                </div>
                
                {/* Product ID */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Product ID: {product.id}
                </div>
              </CardContent>
            </Card>
            
            {/* Description */}
            <Card className="bg-white dark:bg-gray-700">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {productDescription}
                </p>
              </CardContent>
            </Card>
            
            {/* Product Details */}
            {productDetails.length > 0 && (
              <Card className="bg-white dark:bg-gray-700">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Product Details</h4>
                  <ul className="space-y-1">
                    {productDetails.map((detail: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-200 flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline" className="dark:text-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewDialog;